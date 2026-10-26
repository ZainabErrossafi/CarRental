import hashlib

from rest_framework.throttling import SimpleRateThrottle


class PublicAPIKeyThrottle(SimpleRateThrottle):
    scope = 'public_api'

    def get_cache_key(self, request, view):
        key = request.META.get('HTTP_X_API_KEY', '')
        if not key:
            return None
        identity = hashlib.sha256(key.encode('utf-8')).hexdigest()
        return self.cache_format % {'scope': self.scope, 'ident': identity}
