import re
from datetime import timedelta
from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import PasswordChange, User


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class PasswordChangeTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('driver', 'driver@example.com', 'OldSecret987!')
        self.client = APIClient()
        self.client.force_authenticate(self.user)
        self.payload = {'old_password': 'OldSecret987!', 'new_password': 'BrandNewSecret654!'}

    def start(self):
        response = self.client.post('/api/users/change-password/', self.payload, format='json')
        self.assertEqual(response.status_code, 200)
        return re.search(r'\b\d{6}\b', mail.outbox[-1].body).group()

    def confirm(self, code):
        return self.client.post('/api/users/confirm-password/', {'code': code}, format='json')

    def test_email_required_before_change_and_code_is_single_use(self):
        code = self.start()
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.payload['old_password']))
        self.assertEqual(mail.outbox[-1].to, [self.user.email])
        self.assertNotEqual(PasswordChange.objects.get(user=self.user).code_hash, code)
        self.assertEqual(self.confirm(code).status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.payload['new_password']))
        self.assertEqual(self.confirm(code).status_code, 400)

    def test_expiration_and_attempt_limit(self):
        code = self.start()
        wrong = '000000' if code != '000000' else '111111'
        for _ in range(5):
            self.assertEqual(self.confirm(wrong).status_code, 400)
        self.assertEqual(self.confirm(code).status_code, 400)
        PasswordChange.objects.filter(user=self.user).update(attempts=0, created_at=timezone.now()-timedelta(minutes=11))
        self.assertEqual(self.confirm(code).status_code, 400)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password(self.payload['old_password']))

    def test_resend_cooldown_and_replacement(self):
        old_code = self.start()
        self.assertEqual(self.client.post('/api/users/change-password/', self.payload).status_code, 429)
        PasswordChange.objects.filter(user=self.user).update(created_at=timezone.now()-timedelta(seconds=61))
        with patch('apps.users.password_change.secrets.randbelow', return_value=(int(old_code)+1)%1000000):
            new_code = self.start()
        self.assertEqual(self.confirm(old_code).status_code, 400)
        self.assertEqual(self.confirm(new_code).status_code, 200)

    def test_rejects_bad_credentials_and_unauthenticated_requests(self):
        payload = {**self.payload, 'old_password': 'wrong'}
        self.assertEqual(self.client.post('/api/users/change-password/', payload).status_code, 400)
        self.assertFalse(PasswordChange.objects.exists())
        self.client.force_authenticate(None)
        self.assertEqual(self.confirm('123456').status_code, 401)

    def test_email_failure_does_not_leave_challenge(self):
        with patch('apps.users.password_change.send_mail', side_effect=OSError):
            self.assertEqual(self.client.post('/api/users/change-password/', self.payload).status_code, 503)
        self.assertFalse(PasswordChange.objects.exists())

    def test_cannot_use_another_users_code(self):
        code = self.start()
        other = User.objects.create_user('other', 'other@example.com', 'OtherSecret987!')
        self.client.force_authenticate(other)
        self.assertEqual(self.confirm(code).status_code, 400)
