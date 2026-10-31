from django.test import RequestFactory, TestCase

from .adapters import CustomAccountAdapter
from .models import User


class InactiveAccountTests(TestCase):
    def test_inactive_endpoint_returns_json_error(self):
        response = self.client.get('/api/accounts/inactive/')
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {'detail': 'This account is inactive.'})

    def test_allauth_returns_error_instead_of_redirect(self):
        request = RequestFactory().get('/api/accounts/google/login/callback/')
        user = User(username='inactive', is_active=False)
        response = CustomAccountAdapter().respond_user_inactive(request, user)
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response['Content-Type'], 'application/json')
        self.assertNotIn('Location', response)
