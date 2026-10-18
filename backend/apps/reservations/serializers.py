from rest_framework import serializers
from .models import Reservation, ReservationExtra
from django.utils import timezone

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
        pickup_date = data.get('pickup_date', getattr(self.instance, 'pickup_date', None))
        return_date = data.get('return_date', getattr(self.instance, 'return_date', None))

        if pickup_date and return_date and pickup_date >= return_date:
            raise serializers.ValidationError("The return date must be after the pickup date.")
        if self.instance is None and pickup_date and pickup_date < timezone.now():
            raise serializers.ValidationError("The pickup date cannot be in the past.")

        vehicle = data.get('vehicle', getattr(self.instance, 'vehicle', None))
        if vehicle and pickup_date and return_date:
            exclude_id = self.instance.id if self.instance else None
            if not vehicle.is_available(pickup_date, return_date, exclude_reservation_id=exclude_id):
                raise serializers.ValidationError("This vehicle is not available for the selected dates.")

        return data