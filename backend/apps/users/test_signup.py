# ####oussama: Verify that registration never creates a user before email verification.
from datetime import timedelta
from smtplib import SMTPException
from unittest.mock import patch
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient
from .models import PendingSignup, User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class SignupTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.payload = {'username': 'newdriver', 'email': 'DRIVER@example.com', 'password': 'TravelSafely392!'}

    def start_signup(self):
        response = self.client.post('/api/auth/signup/', self.payload, format='json')
        self.assertEqual(response.status_code, 201, response.data)
        self.assertFalse(User.objects.exists())
        return PendingSignup.objects.get(), response.data['ephemeral_token']

    def verify(self, token, code):
        return self.client.post('/api/auth/2fa/verify/', {'ephemeral_token': token, 'code': code}, format='json')

    def age_code(self, pending, seconds=61):
        PendingSignup.objects.filter(pk=pending.pk).update(two_factor_code_created_at=timezone.now() - timedelta(seconds=seconds))

    def test_user_created_only_after_correct_email_code(self):
        pending, token = self.start_signup()
        self.assertNotEqual(pending.password, self.payload['password'])
        self.assertTrue(pending.check_password(self.payload['password']))
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['driver@example.com'])
        self.assertIn(pending.two_factor_code, mail.outbox[0].body)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(self.client.get('/api/users/me/').status_code, 401)
        self.client.credentials()
        verified = self.verify(token, pending.two_factor_code)
        self.assertEqual(verified.status_code, 200, verified.data)
        user = User.objects.get()
        self.assertEqual(user.role, 'client')
        self.assertFalse(user.is_staff)
        self.assertTrue(user.is_active)
        self.assertTrue(user.email_verified)
        self.assertTrue(user.two_factor_enabled)
        self.assertTrue(user.check_password(self.payload['password']))
        self.assertFalse(PendingSignup.objects.exists())
        self.assertEqual(self.verify(token, pending.two_factor_code).status_code, 401)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {verified.data['access']}")
        self.assertEqual(self.client.get('/api/users/me/').data['id'], user.pk)
        self.client.credentials()
        login = self.client.post('/api/token/', {'email': user.email, 'password': self.payload['password']}, format='json')
        self.assertEqual(login.status_code, 200)
        self.assertTrue(login.data['two_factor_required'])
        self.assertNotIn('access', login.data)

    def test_weak_or_missing_password_creates_nothing(self):
        for password in [None, '', '12345678', 'newdriver']:
            payload = {**self.payload}
            if password is None:
                payload.pop('password')
            else:
                payload['password'] = password
            response = self.client.post('/api/auth/signup/', payload, format='json')
            self.assertEqual(response.status_code, 400)
            self.assertIn('password', response.data)
        self.assertFalse(User.objects.exists())
        self.assertFalse(PendingSignup.objects.exists())

    def test_existing_users_are_not_overwritten(self):
        user = User.objects.create_user('existing', 'driver@example.com', 'TravelSafely392!')
        for payload in [self.payload, {**self.payload, 'username': 'existing', 'email': 'other@example.com'}]:
            self.assertEqual(self.client.post('/api/auth/signup/', payload, format='json').status_code, 400)
        self.assertEqual(User.objects.count(), 1)
        self.assertFalse(PendingSignup.objects.exists())

    def test_five_wrong_codes_never_create_user(self):
        pending, token = self.start_signup()
        wrong = '000000' if pending.two_factor_code != '000000' else '111111'
        for _ in range(5):
            self.assertEqual(self.verify(token, wrong).status_code, 401)
        self.assertEqual(self.verify(token, pending.two_factor_code).status_code, 401)
        self.assertFalse(User.objects.exists())

    def test_resend_cooldown_preserves_pending_request(self):
        pending, token = self.start_signup()
        payload = {'ephemeral_token': token}
        self.assertEqual(self.client.post('/api/auth/2fa/resend/', payload, format='json').status_code, 429)
        self.age_code(pending, seconds=661)
        self.assertEqual(self.verify(token, pending.two_factor_code).status_code, 401)
        self.assertFalse(User.objects.exists())
        self.assertEqual(self.client.post('/api/auth/2fa/resend/', payload, format='json').status_code, 200)
        pending.refresh_from_db()
        self.assertEqual(self.verify(token, pending.two_factor_code).status_code, 200)

    def test_retry_signup_and_login_resume_without_creating_user(self):
        pending, old_token = self.start_signup()
        self.assertEqual(self.client.post('/api/auth/signup/', self.payload, format='json').status_code, 429)
        self.age_code(pending)
        response = self.client.post('/api/auth/signup/', self.payload, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('access', response.data)
        self.assertFalse(User.objects.exists())
        self.assertEqual(PendingSignup.objects.count(), 1)
        self.assertEqual(self.verify(old_token, pending.two_factor_code).status_code, 401)
        self.age_code(pending)
        response = self.client.post('/api/token/', {'email': pending.email, 'password': self.payload['password']}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['email_verification_required'])
        self.assertFalse(User.objects.exists())

    def test_wrong_credentials_cannot_replace_pending_request(self):
        pending, token = self.start_signup()
        self.age_code(pending)
        for changes in [{'password': 'DifferentPassword392!'}, {'username': 'otherdriver'}]:
            self.assertEqual(self.client.post('/api/auth/signup/', {**self.payload, **changes}, format='json').status_code, 400)
        pending.refresh_from_db()
        self.assertTrue(pending.check_password(self.payload['password']))
        self.assertFalse(User.objects.exists())
        self.assertEqual(len(mail.outbox), 1)

    def test_expired_request_cannot_create_user_and_can_be_replaced(self):
        pending, token = self.start_signup()
        PendingSignup.objects.filter(pk=pending.pk).update(expires_at=timezone.now() - timedelta(seconds=1))
        self.assertEqual(self.verify(token, pending.two_factor_code).status_code, 401)
        self.assertFalse(User.objects.exists())
        self.assertEqual(self.client.post('/api/auth/signup/', self.payload, format='json').status_code, 201)
        self.assertFalse(PendingSignup.objects.filter(pk=pending.pk).exists())
        self.assertEqual(PendingSignup.objects.count(), 1)

    @patch('apps.users.models.send_mail', side_effect=SMTPException('Unavailable'))
    def test_delivery_failure_leaves_no_user_or_pending_request(self, send):
        self.assertEqual(self.client.post('/api/auth/signup/', self.payload, format='json').status_code, 503)
        self.assertFalse(User.objects.exists())
        self.assertFalse(PendingSignup.objects.exists())

    def test_conflict_at_verification_does_not_create_extra_user(self):
        pending, token = self.start_signup()
        User.objects.create_user('other', pending.email, 'OtherPassword392!')
        response = self.verify(token, pending.two_factor_code)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 1)
        self.assertTrue(PendingSignup.objects.filter(pk=pending.pk).exists())
