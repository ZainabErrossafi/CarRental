from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Reservation, ReservationExtra
from .serializers import ReservationSerializer, ReservationExtraSerializer


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer

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