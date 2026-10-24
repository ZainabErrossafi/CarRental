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

    def test_login_without_2fa(self):
        self.user.two_factor_enabled = False
        self.user.save()

        response = self.login()

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

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
