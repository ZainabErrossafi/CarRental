import uuid

from django.db.models import Sum, Count
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from apps.users.permissions import IsAdmin, IsAdminOrOwner
from .models import Reservation, ReservationExtra, ReservationStatus
from .serializers import ReservationSerializer, ReservationExtraSerializer
from django.db import transaction

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

    def get_permissions(self):
        if self.action in ['create', 'list']:
            return [IsAuthenticated()]
        elif self.action in ['retrieve', 'cancel']:
            return [IsAdminOrOwner()]
        else:
            return [IsAdmin()]

    def perform_create(self, serializer):
        with transaction.atomic():
            reference = f"RES-{uuid.uuid4().hex[:8].upper()}"
            reservation = serializer.save(user=self.request.user, reference=reference, total_price=0)
            reservation.total_price = reservation.calculate_total()
            reservation.save()
            reservation.notify_admins(
                'reservation_created',
                'New reservation',
                f"Reservation {reservation.reference} by {reservation.driver_name} is waiting for confirmation.",
            )

    def perform_update(self, serializer):
        if serializer.instance.status in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]:
            raise ValidationError({'detail': 'A cancelled or completed reservation cannot be modified.'})
        with transaction.atomic():
            reservation = serializer.save()
            reservation.refresh_total()

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != ReservationStatus.PENDING:
            return Response({'detail': 'Only pending reservations can be confirmed.'}, status=400)
        reservation.confirm()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status in [ReservationStatus.CANCELLED, ReservationStatus.COMPLETED]:
            return Response({'detail': 'This reservation can no longer be cancelled.'}, status=400)
        reservation.cancel(by=request.user)
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        reservation = self.get_object()
        if reservation.status != ReservationStatus.CONFIRMED:
            return Response({'detail': 'Only confirmed reservations can be completed.'}, status=400)
        reservation.complete()
        serializer = self.get_serializer(reservation)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[IsAdmin])
    def stats(self, request):
        total = Reservation.objects.count()
        by_status = Reservation.objects.values('status').annotate(count=Count('id'))
        by_status_dict = {row['status']: row['count'] for row in by_status}

        active = Reservation.objects.filter(status__in=[ReservationStatus.PENDING, ReservationStatus.CONFIRMED]).count()

        revenue = Reservation.objects.filter(
            status__in=[ReservationStatus.CONFIRMED, ReservationStatus.COMPLETED]
        ).aggregate(total=Sum('total_price'))['total'] or 0

        cancelled = by_status_dict.get(ReservationStatus.CANCELLED, 0)
        cancellation_rate = round((cancelled / total) * 100, 1) if total > 0 else 0

        return Response({
            'total_reservations': total,
            'active_reservations': active,
            'by_status': by_status_dict,
            'total_revenue': revenue,
            'cancellation_rate': cancellation_rate,
        })


class ReservationExtraViewSet(viewsets.ModelViewSet):
    queryset = ReservationExtra.objects.all()
    serializer_class = ReservationExtraSerializer
    permission_classes = [IsAdmin]
