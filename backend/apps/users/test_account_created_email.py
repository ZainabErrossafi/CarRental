from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import Role, User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AccountCreatedEmailTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user('admin', 'admin@example.com', 'Secret987!', role=Role.ADMIN)
        self.client = APIClient()
        self.client.force_authenticate(self.admin)
        self.details = {
            'username': 'driver', 'email': 'driver@example.com',
            'password': ' StrongPassword123! ', 'first_name': '<Driver>',
            'role': Role.CLIENT,
        }

    def create_user(self):
        with self.captureOnCommitCallbacks(execute=True):
            return self.client.post('/api/users/', self.details, format='json')

    def test_creation_emails_credentials_and_password_change_reminder(self):
        response = self.create_user()
        self.assertEqual(response.status_code, 201)
        self.assertNotIn('password', response.data)
        user = User.objects.get(username='driver')
        self.assertTrue(user.check_password(self.details['password']))
        self.assertNotEqual(user.password, self.details['password'])
        self.assertEqual(len(mail.outbox), 1)
        message = mail.outbox[0]
        self.assertEqual(message.to, [user.email])
        for value in (user.username, user.email, self.details['password'], 'Client'):
            self.assertIn(value, message.body)
        self.assertIn('change your password immediately', message.body)
        self.assertIn('&lt;Driver&gt;', message.alternatives[0][0])
        mail.outbox.clear()
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(f'/api/users/{user.pk}/', {'first_name': 'Updated'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(mail.outbox), 0)

    def test_invalid_creation_does_not_send_email(self):
        self.details['password'] = 'short'
        self.assertEqual(self.create_user().status_code, 400)
        self.assertEqual(len(mail.outbox), 0)

    def test_mail_failure_keeps_created_account(self):
        with patch('apps.users.serializers.send_mail', side_effect=OSError), \
                self.assertLogs('apps.users.serializers', level='ERROR'):
            response = self.create_user()
        self.assertEqual(response.status_code, 201)
        self.assertTrue(User.objects.filter(username='driver').exists())
