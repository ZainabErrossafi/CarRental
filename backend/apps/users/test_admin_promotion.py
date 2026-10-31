from unittest.mock import patch

from django.core import mail
from django.test import TestCase, override_settings

from .models import Role, User
from .serializers import UserSerializer


@override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
class AdminPromotionEmailTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('driver', 'driver@example.com', 'Secret987!')

    def update_user(self, **data):
        serializer = UserSerializer(self.user, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        with self.captureOnCommitCallbacks(execute=True):
            self.user = serializer.save()

    def test_promotion_sends_email_to_promoted_user(self):
        self.update_user(role=Role.ADMIN)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, Role.ADMIN)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, [self.user.email])
        self.assertIn('admin', mail.outbox[0].subject)

    def test_other_updates_and_demotion_do_not_send_email(self):
        self.update_user(first_name='Driver')
        self.assertEqual(len(mail.outbox), 0)
        self.update_user(role=Role.ADMIN)
        mail.outbox.clear()
        self.update_user(role=Role.ADMIN, first_name='Admin')
        self.update_user(role=Role.CLIENT)
        self.assertEqual(len(mail.outbox), 0)

    def test_email_failure_keeps_role_change(self):
        with patch('apps.users.serializers.send_mail', side_effect=OSError), \
                self.assertLogs('apps.users.serializers', level='ERROR'):
            self.update_user(role=Role.ADMIN)
        self.user.refresh_from_db()
        self.assertEqual(self.user.role, Role.ADMIN)
