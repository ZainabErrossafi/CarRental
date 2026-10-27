import hmac

from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class PublicAPIPrincipal:
    """Non-user identity representing a valid server-to-server API key."""

    is_authenticated = True
    is_anonymous = False
    is_active = True


class PublicAPIKeyAuthentication(BaseAuthentication):
    keyword = 'ApiKey'

    def authenticate(self, request):
        expected_key = getattr(settings, 'PUBLIC_API_KEY', '')
        provided_key = request.META.get('HTTP_X_API_KEY', '')

        if not expected_key:
            raise AuthenticationFailed('The public API is not configured.')
        if not provided_key or not hmac.compare_digest(provided_key, expected_key):
            raise AuthenticationFailed('A valid X-API-Key header is required.')

        return PublicAPIPrincipal(), None

    def authenticate_header(self, request):
        return self.keyword
