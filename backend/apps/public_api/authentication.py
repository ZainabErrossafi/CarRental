from django.utils import timezone
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .models import PublicAPIKey


class PublicAPIKeyAuthentication(BaseAuthentication):
    keyword = 'ApiKey'

    def authenticate(self, request):
        provided_key = request.META.get('HTTP_X_API_KEY', '')
        if not provided_key or len(provided_key) > 256:
            raise AuthenticationFailed('A valid X-API-Key header is required.')
        key = PublicAPIKey.objects.select_related('user').filter(
            key_hash=PublicAPIKey.digest(provided_key), is_active=True,
            expires_at__gt=timezone.now(), user__is_active=True,
        ).first()
        if key is None:
            raise AuthenticationFailed('A valid X-API-Key header is required.')
        return key.user, key

    def authenticate_header(self, request):
        return self.keyword
