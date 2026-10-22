import uuid

from django.db import transaction
from django.db.models import Sum, Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.users.permissions import IsAdmin, IsAdminOrOwner
from .models import Reservation, ReservationExtra, ReservationStatus
from .serializers import ReservationSerializer, ReservationExtraSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

    filterset_fields = ['status', 'vehicle', 'user']
    search_fields = ['reference', 'driver_name', 'email']
    ordering_fields = ['pickup_date', 'return_date', 'total_price', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        elif self.action in ['retrieve', 'cancel']:
            return [IsAdminOrOwner()]
        else:
            return [IsAdmin()]

    def get_queryset(self):
        user = self.request.user
        if not user.is_authenticated:
            return Reservation.objects.none()
        if user.is_admin():
            return Reservation.objects.all()
        return Reservation.objects.filter(user=user)

    def perform_create(self, serializer):
        if self.request.user.is_admin():
            owner = serializer.validated_data.get('user')
            if owner is None:
                raise ValidationError({'user_id': 'A customer is required to create a reservation.'})
        else:
            owner = self.request.user
        reference = f"RES-{uuid.uuid4().hex[:8].upper()}"
        with transaction.atomic():
            reservation = serializer.save(user=owner, reference=reference)
            reservation.notify_admins(
                'reservation_created',
                'New reservation',
                f"Reservation {reservation.reference} by {reservation.driver_name} is waiting for confirmation.",
            )

    def perform_update(self, serializer):
        if serializer.instance.status in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]:
            raise ValidationError({'detail': 'A cancelled or completed reservation cannot be modified.'})
        serializer.save()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != ReservationStatus.PENDING:
            return Response({'detail': 'Only pending reservations can be confirmed.'}, status=400)
        reservation.confirm()
        return Response(self.get_serializer(reservation).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]:
            return Response({'detail': 'This reservation can no longer be cancelled.'}, status=400)
        reservation.cancel(by=request.user)
        return Response(self.get_serializer(reservation).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != ReservationStatus.CONFIRMED:
            return Response({'detail': 'Only confirmed reservations can be completed.'}, status=400)
        reservation.complete()
        return Response(self.get_serializer(reservation).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        total = Reservation.objects.count()
        by_status = dict(
            Reservation.objects.values_list('status').annotate(count=Count('id'))
        )
        active = by_status.get(ReservationStatus.PENDING, 0) + by_status.get(ReservationStatus.CONFIRMED, 0)
        revenue = Reservation.objects.filter(
            status__in=[ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED]
        ).aggregate(total=Sum('total_price'))['total'] or 0
        cancelled = by_status.get(ReservationStatus.CANCELLED, 0)
        cancellation_rate = round((cancelled / total) * 100, 1) if total else 0

        return Response({
            'total_reservations': total,
            'active_reservations': active,
            'by_status': by_status,
            'total_revenue': revenue,
            'cancellation_rate': cancellation_rate,
        })


class ReservationExtraViewSet(viewsets.ModelViewSet):
    queryset = ReservationExtra.objects.all()
    serializer_class = ReservationExtraSerializer
    permission_classes = [IsAdmin]
