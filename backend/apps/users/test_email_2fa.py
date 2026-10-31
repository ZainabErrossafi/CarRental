from django.core import mail
from django.core.cache import cache
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class EmailTwoFactorTests(TestCase):
    def setUp(self):
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='client', email='client@example.com',
            password='StrongPassword123!', two_factor_enabled=True,
        )

    def login(self):
        return self.client.post('/api/token/', {
            'email': self.user.email, 'password': 'StrongPassword123!',
        })

    def test_two_factor_is_disabled_by_default(self):
        user = User.objects.create_user(username='default', email='default@example.com', password='StrongPassword123!')
        self.assertFalse(user.two_factor_enabled)

    def test_login_without_two_factor_returns_tokens_without_email(self):
        self.user.two_factor_enabled = False
        self.user.save()
        response = self.login()
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertNotIn('two_factor_required', response.data)
        self.assertEqual(len(mail.outbox), 0)

    def test_user_can_enable_then_disable_login_two_factor(self):
        self.client.force_authenticate(self.user)
        for enabled in (False, True, False):
            response = self.client.post('/api/auth/2fa/toggle/', {
                'enabled': enabled, 'password': 'StrongPassword123!',
            })
            self.assertEqual(response.status_code, 200)
            profile = self.client.get('/api/users/me/')
            self.assertEqual(profile.data['two_factor_enabled'], enabled)
            login = self.login()
            self.assertEqual(login.status_code, 200)
            self.assertEqual(login.data.get('two_factor_required', False), enabled)
            self.assertEqual('access' in login.data, not enabled)

    def test_profile_cannot_bypass_password_protected_toggle(self):
        self.client.force_authenticate(self.user)
        response = self.client.patch(f'/api/users/{self.user.pk}/', {'two_factor_enabled': False})
        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.two_factor_enabled)

    def test_login_with_correct_code(self):
        login_response = self.login()
        self.assertTrue(login_response.data['two_factor_required'])
        self.assertNotIn('access', login_response.data)
        self.user.refresh_from_db()
        self.assertIn(self.user.two_factor_code, mail.outbox[0].body)

        response = self.client.post('/api/auth/2fa/verify/', {
            'ephemeral_token': login_response.data['ephemeral_token'],
            'code': self.user.two_factor_code,
        })

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.user.refresh_from_db()
        self.assertIsNone(self.user.two_factor_code)

    def test_login_with_wrong_code(self):
        login_response = self.login()
        self.user.refresh_from_db()
        wrong_code = '000000' if self.user.two_factor_code != '000000' else '111111'

        response = self.client.post('/api/auth/2fa/verify/', {
            'ephemeral_token': login_response.data['ephemeral_token'],
            'code': wrong_code,
        })

        self.assertEqual(response.status_code, 401)
        self.assertNotIn('access', response.data)

    def test_wrong_password_does_not_send_code(self):
        response = self.client.post('/api/token/', {
            'username': self.user.username, 'password': 'wrong-password',
        })
        self.assertEqual(response.status_code, 401)
        self.assertEqual(len(mail.outbox), 0)

    def test_legacy_login_cannot_bypass_email_verification(self):
        self.user.two_factor_enabled = False
        self.user.save()
        response = self.client.post('/api/auth/login/', {
            'username': self.user.username, 'password': 'StrongPassword123!',
        })
        self.assertIn(response.status_code, (400, 401, 403))
        self.assertNotIn('access', response.data)

    def test_code_cannot_be_reused(self):
        login_response = self.login()
        self.user.refresh_from_db()
        payload = {'ephemeral_token': login_response.data['ephemeral_token'],
                   'code': self.user.two_factor_code}
        self.assertEqual(self.client.post('/api/auth/2fa/verify/', payload).status_code, 200)
        self.assertEqual(self.client.post('/api/auth/2fa/verify/', payload).status_code, 401)

    def test_expired_code_is_rejected(self):
        from datetime import timedelta
        from django.utils import timezone
        login_response = self.login()
        self.user.refresh_from_db()
        self.user.two_factor_code_created_at = timezone.now() - timedelta(minutes=11)
        self.user.save(update_fields=['two_factor_code_created_at'])
        response = self.client.post('/api/auth/2fa/verify/', {
            'ephemeral_token': login_response.data['ephemeral_token'],
            'code': self.user.two_factor_code,
        })
        self.assertEqual(response.status_code, 401)
        self.assertNotIn('access', response.data)

    def test_repeated_login_observes_email_cooldown(self):
        self.assertEqual(self.login().status_code, 200)
        self.assertEqual(self.login().status_code, 429)
        self.assertEqual(len(mail.outbox), 1)
