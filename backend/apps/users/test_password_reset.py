import re
from datetime import timedelta
from unittest.mock import patch

from allauth.socialaccount.models import SocialAccount
from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import PasswordResetChallenge, User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PasswordResetTests(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('driver', 'driver@example.com', 'OldSecret987!')
        self.client = APIClient()

    def start(self):
        response = self.client.post('/api/auth/password-reset/request/',
                                    {'email': self.user.email}, format='json')
        self.assertEqual(response.status_code, 200)
        return re.search(r'\b\d{6}\b', mail.outbox[-1].body).group()

    def submit(self, step, code, **extra):
        return self.client.post(f'/api/auth/password-reset/{step}/',
                                {'email': self.user.email, 'code': code, **extra}, format='json')

    def test_request_rejects_unknown_email(self):
        response = self.client.post('/api/auth/password-reset/request/',
                                    {'email': 'missing@example.com'}, format='json')
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.data, {'detail': 'No account exists for this email.'})
        self.assertEqual(len(mail.outbox), 0)
        self.assertFalse(PasswordResetChallenge.objects.exists())

    def test_request_matches_email_case_insensitively(self):
        response = self.client.post('/api/auth/password-reset/request/',
                                    {'email': 'DRIVER@EXAMPLE.COM'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(mail.outbox[-1].to, [self.user.email])

    def test_request_verify_confirm_and_single_use(self):
        code = self.start()
        self.assertEqual(mail.outbox[-1].to, [self.user.email])
        self.assertNotEqual(PasswordResetChallenge.objects.get(user=self.user).code_hash, code)
        self.assertEqual(self.submit('verify', code).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('OldSecret987!'))
        self.assertTrue(PasswordResetChallenge.objects.filter(user=self.user).exists())
        self.assertEqual(self.submit('confirm', code, new_password='BrandNewSecret654!').status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('BrandNewSecret654!'))
        self.assertEqual(self.submit('verify', code).status_code, 400)
        self.assertEqual(self.submit('confirm', code, new_password='AnotherSecret987!').status_code, 400)

    def test_google_account_can_set_first_password_after_email_verification(self):
        self.user.set_unusable_password()
        self.user.save(update_fields=['password'])
        social = SocialAccount.objects.create(user=self.user, provider='google', uid='google-driver')
        self.assertFalse(self.user.has_usable_password())

        code = self.start()
        self.assertEqual(self.submit('verify', code).status_code, 200)
        self.user.refresh_from_db()
        self.assertFalse(self.user.has_usable_password())
        self.assertEqual(self.submit('confirm', code, new_password='BrandNewSecret654!').status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.has_usable_password())
        self.assertTrue(self.user.check_password('BrandNewSecret654!'))
        self.assertTrue(SocialAccount.objects.filter(pk=social.pk, user=self.user).exists())
        login = self.client.post('/api/token/', {
            'email': self.user.email, 'password': 'BrandNewSecret654!',
        }, format='json')
        self.assertEqual(login.status_code, 200, login.data)
        self.assertIn('access', login.data)
        self.assertEqual(self.submit('confirm', code, new_password='AnotherSecret987!').status_code, 400)

    def test_google_account_password_setup_requires_valid_code(self):
        self.user.set_unusable_password()
        self.user.save(update_fields=['password'])
        SocialAccount.objects.create(user=self.user, provider='google', uid='google-driver')
        code = self.start()
        wrong = '000000' if code != '000000' else '111111'
        self.assertEqual(self.submit('confirm', wrong, new_password='BrandNewSecret654!').status_code, 400)
        self.user.refresh_from_db()
        self.assertFalse(self.user.has_usable_password())

    def test_verify_and_confirm_share_attempt_limit(self):
        code = self.start()
        wrong = '000000' if code != '000000' else '111111'
        for step in ['verify', 'confirm', 'verify', 'confirm', 'verify']:
            self.assertEqual(self.submit(step, wrong, new_password='BrandNewSecret654!').status_code, 400)
        self.assertEqual(PasswordResetChallenge.objects.get(user=self.user).attempts, 5)
        self.assertEqual(self.submit('verify', code).status_code, 400)
        self.assertEqual(self.submit('confirm', code, new_password='BrandNewSecret654!').status_code, 400)

    def test_verify_rejects_expired_code(self):
        code = self.start()
        PasswordResetChallenge.objects.filter(user=self.user).update(
            created_at=timezone.now() - timedelta(minutes=10))
        self.assertEqual(self.submit('verify', code).status_code, 400)

    def test_confirm_rechecks_expiry_after_verification(self):
        code = self.start()
        self.assertEqual(self.submit('verify', code).status_code, 200)
        PasswordResetChallenge.objects.filter(user=self.user).update(
            created_at=timezone.now() - timedelta(minutes=10))
        self.assertEqual(self.submit('confirm', code, new_password='BrandNewSecret654!').status_code, 400)

    def test_verify_rejects_changed_password_and_ineligible_users(self):
        code = self.start()
        for field, value in [('is_active', False), ('email_verified', False), ('password', 'changed')]:
            original = getattr(self.user, field)
            User.objects.filter(pk=self.user.pk).update(**{field: value})
            self.assertEqual(self.submit('verify', code).status_code, 400)
            User.objects.filter(pk=self.user.pk).update(**{field: original})

    def test_verify_rejects_missing_challenge_and_malformed_code(self):
        self.assertEqual(self.submit('verify', '123456').status_code, 400)
        self.assertEqual(self.submit('verify', 'abcdef').status_code, 400)

    def test_password_validation_keeps_challenge_available(self):
        code = self.start()
        for password in ['OldSecret987!', 'short']:
            response = self.submit('confirm', code, new_password=password)
            self.assertEqual(response.status_code, 400)
            self.assertIn('new_password', response.data)
        self.assertEqual(self.submit('verify', code).status_code, 200)

    def test_email_failure_rolls_back_challenge(self):
        with patch('apps.users.password_reset.send_mail', side_effect=OSError):
            response = self.client.post('/api/auth/password-reset/request/', {'email': self.user.email})
        self.assertEqual(response.status_code, 503)
        self.assertFalse(PasswordResetChallenge.objects.exists())
