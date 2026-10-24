from django.test import TestCase
from rest_framework.test import APIClient
from .models import User
from urllib.parse import urlsplit, parse_qs
from rest_framework_simplejwt.tokens import AccessToken


class FrontendAuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@example.com', 'StrongPassword123!')

    def test_email_login_current_user_refresh_and_paginated_list(self):
        response = self.client.post('/api/token/', {'email': 'ADMIN@example.com', 'password': 'StrongPassword123!'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.data['access']}")
        profile = self.client.get('/api/users/me/')
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data['role'], 'admin')
        users = self.client.get('/api/users/')
        self.assertEqual(users.status_code, 200)
        self.assertEqual(users.data['results'][0]['id'], self.admin.id)
        refresh = self.client.post('/api/token/refresh/', {'refresh': response.data['refresh']}, format='json')
        self.assertEqual(refresh.status_code, 200)
        self.assertIn('access', refresh.data)

    def test_bad_password_is_rejected_and_client_can_login(self):
        User.objects.create_user('client', 'client@example.com', 'StrongPassword123!')
        response = self.client.post('/api/token/', {'email': 'admin@example.com', 'password': 'wrong'}, format='json')
        self.assertEqual(response.status_code, 401)
        response = self.client.post('/api/token/', {'email': 'client@example.com', 'password': 'StrongPassword123!'}, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['role'], 'client')

    def test_duplicate_emails_are_rejected(self):
        # The database prevents exact duplicates; ambiguous case variants must
        # still fail safely on databases with case-sensitive unique constraints.
        User.objects.create_user('duplicate', 'ADMIN@example.com', 'StrongPassword123!')
        response = self.client.post('/api/token/', {'email': 'admin@example.com', 'password': 'StrongPassword123!'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_profile_requires_authentication(self):
        self.assertEqual(self.client.get('/api/users/me/').status_code, 401)

    def test_health(self):
        self.assertEqual(self.client.get('/api/health/').json(), {'status': 'ok'})

    def test_google_callback_hands_off_tokens_for_authenticated_session(self):
        self.client.force_login(self.admin)
        response = self.client.get('/api/auth/google/success/')
        self.assertEqual(response.status_code, 302)
        destination = urlsplit(response.url)
        self.assertEqual(destination.path, '/')
        self.assertEqual(destination.netloc, '')
        self.assertEqual(destination.query, '')
        tokens = parse_qs(destination.fragment)
        access = tokens['access'][0]
        self.assertEqual(str(AccessToken(access)['user_id']), str(self.admin.pk))
        self.assertIn('refresh', tokens)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access}')
        self.assertEqual(self.client.get('/api/users/me/').status_code, 200)

    def test_google_callback_requires_a_session(self):
        response = self.client.get('/api/auth/google/success/')
        self.assertRedirects(response, '/login?error=auth_failed', fetch_redirect_response=False)


# ####oussama: Merge regressions for main's username/user contract and the email 2FA guard.
class MergedAuthenticationTests(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.client = APIClient()
        self.user = User.objects.create_user('mergedriver', 'mergedriver@example.com', 'TravelSafely392!')

    def test_username_login_keeps_user_response(self):
        response = self.client.post('/api/token/', {'username': self.user.username, 'password': 'TravelSafely392!'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['id'], self.user.pk)
        self.assertEqual(response.data['user']['username'], self.user.username)

    def test_username_login_cannot_bypass_email_two_factor(self):
        from django.test import override_settings
        self.user.two_factor_enabled = True
        self.user.save()
        with override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend'):
            response = self.client.post('/api/token/', {'username': self.user.username, 'password': 'TravelSafely392!'}, format='json')
        self.assertEqual(response.status_code, 200, response.data)
        self.assertTrue(response.data['two_factor_required'])
        self.assertNotIn('access', response.data)
        self.assertNotIn('user', response.data)
