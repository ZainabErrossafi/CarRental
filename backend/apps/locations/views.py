from django.db.models import ProtectedError
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.users.permissions import IsAdmin
from .models import Location
from .serializers import LocationSerializer


class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

    filterset_fields = ['city', 'country', 'active']
    search_fields = ['name', 'city']
    ordering_fields = ['name', 'city']
    ordering = ['name']

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or self.request.user.role != 'admin':
            return queryset.filter(active=True)
        return queryset

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdmin()]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': 'This location is used by reservations. Set it inactive instead.'},
                status=409,
            )