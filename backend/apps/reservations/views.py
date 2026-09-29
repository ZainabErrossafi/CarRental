from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsAdmin, IsAdminOrOwner
from .models import Reservation, ReservationExtra
from .serializers import ReservationSerializer, ReservationExtraSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    filterset_fields = ['status', 'vehicle', 'user']
    search_fields = ['reference', 'driver_name', 'email']
    ordering_fields = ['pickup_date', 'return_date', 'total_price', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action == 'create':
            return [IsAuthenticated()]
        elif self.action in ['retrieve', 'cancel']:
            return [IsAdminOrOwner()]
        else:
            return [IsAdmin()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        reservation.confirm()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        reservation.cancel()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        reservation = self.get_object()
        reservation.complete()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)


class ReservationExtraViewSet(viewsets.ModelViewSet):
    queryset = ReservationExtra.objects.all()
    serializer_class = ReservationExtraSerializer
    permission_classes = [IsAdmin]