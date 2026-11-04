from rest_framework.permissions import BasePermission, SAFE_METHODS


class PublicAPIReadOrAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user.is_authenticated and (
            request.method in SAFE_METHODS or request.user.is_admin()
        ))
