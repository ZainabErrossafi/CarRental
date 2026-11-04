from rest_framework.throttling import SimpleRateThrottle


class PublicAPIKeyThrottle(SimpleRateThrottle):
    scope = 'public_api'

    def get_cache_key(self, request, view):
        if not request.user.is_authenticated:
            return None
        return self.cache_format % {'scope': self.scope, 'ident': str(request.user.pk)}
