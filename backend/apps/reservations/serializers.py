from rest_framework import serializers
from .models import Reservation, ReservationExtra


class ReservationExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationExtra
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = '__all__'