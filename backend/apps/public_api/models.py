import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.db import models, transaction
from django.utils import timezone


class PublicAPIKey(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='public_api_key')
    key_hash = models.CharField(max_length=64, unique=True, editable=False)
    prefix = models.CharField(max_length=16, editable=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()

    @staticmethod
    def digest(raw_key):
        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

    @classmethod
    def issue(cls, user):
        # Lock the user even when no key exists yet, serializing concurrent rotations.
        with transaction.atomic():
            type(user).objects.select_for_update().get(pk=user.pk)
            raw_key = 'rently_' + secrets.token_urlsafe(48)
            now = timezone.now()
            key, _ = cls.objects.update_or_create(user=user, defaults={
                'key_hash': cls.digest(raw_key), 'prefix': raw_key[:16],
                'is_active': True, 'created_at': now,
                'expires_at': now + timedelta(days=365),
            })
        return key, raw_key
