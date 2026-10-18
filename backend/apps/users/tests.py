from django.test import TestCase
from rest_framework.test import APIClient
from .models import User


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

    def test_bad_password_and_client_role_are_rejected(self):
        User.objects.create_user('client', 'client@example.com', 'StrongPassword123!')
        for email, password in [('admin@example.com', 'wrong'), ('client@example.com', 'StrongPassword123!')]:
            response = self.client.post('/api/token/', {'email': email, 'password': password}, format='json')
            self.assertEqual(response.status_code, 401)

    def test_duplicate_emails_are_rejected(self):
        User.objects.create_user('duplicate', 'admin@example.com', 'StrongPassword123!')
        response = self.client.post('/api/token/', {'email': 'admin@example.com', 'password': 'StrongPassword123!'}, format='json')
        self.assertEqual(response.status_code, 401)

    def test_profile_requires_authentication(self):
        self.assertEqual(self.client.get('/api/users/me/').status_code, 401)

    def test_health(self):
        self.assertEqual(self.client.get('/api/health/').json(), {'status': 'ok'})
