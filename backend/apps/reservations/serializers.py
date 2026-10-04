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
        read_only_fields = ['reference', 'total_price', 'status', 'user']

    def validate(self, data):
        pickup_date = data.get('pickup_date')
        return_date = data.get('return_date')
        if pickup_date and return_date and pickup_date >= return_date:
            raise serializers.ValidationError("La date de retour doit être après la date de récupération.")
        return data