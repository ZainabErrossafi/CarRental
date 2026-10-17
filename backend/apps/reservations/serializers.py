from django.contrib.auth import get_user_model
from django.db import transaction
from apps.extras.models import Extra
from rest_framework import serializers
from .models import Reservation, ReservationExtra


class ReservationExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservationExtra
        fields = '__all__'


class ReservationSerializer(serializers.ModelSerializer):
    vehicle_name = serializers.SerializerMethodField()
    pickup_location_name = serializers.CharField(source='pickup_location.name', read_only=True)
    dropoff_location_name = serializers.CharField(source='dropoff_location.name', read_only=True)
    extra_details = serializers.SerializerMethodField()

    def get_vehicle_name(self, obj):
        return f'{obj.vehicle.brand.name} {obj.vehicle.model}'

    def get_extra_details(self, obj):
        return [{'name': item.extra.name, 'quantity': item.quantity}
                for item in obj.reservation_extras.select_related('extra')]

    user_id = serializers.PrimaryKeyRelatedField(
        source='user', queryset=get_user_model().objects.all(),
        required=False, allow_null=True, write_only=True,
    )
    extras = serializers.PrimaryKeyRelatedField(
        queryset=Extra.objects.filter(active=True), many=True,
        required=False, write_only=True,
    )

    @transaction.atomic
    def create(self, validated_data):
        extras = validated_data.pop('extras', [])
        reservation = Reservation.objects.create(total_price=0, **validated_data)
        for extra in set(extras):
            ReservationExtra.objects.create(reservation=reservation, extra=extra, quantity=1)
        reservation.total_price = reservation.calculate_total()
        reservation.save(update_fields=['total_price'])
        return reservation

    @transaction.atomic
    def update(self, instance, validated_data):
        extras = validated_data.pop('extras', None)
        reservation = super().update(instance, validated_data)
        if extras is not None:
            reservation.reservation_extras.all().delete()
            for extra in set(extras):
                ReservationExtra.objects.create(reservation=reservation, extra=extra, quantity=1)
        reservation.total_price = reservation.calculate_total()
        reservation.save(update_fields=['total_price'])
        return reservation

    class Meta:
        model = Reservation
        fields = '__all__'
        read_only_fields = ['reference', 'total_price', 'status', 'user']

    def validate(self, data):
        pickup_date = data.get('pickup_date', getattr(self.instance, 'pickup_date', None))
        return_date = data.get('return_date', getattr(self.instance, 'return_date', None))
        if pickup_date and return_date and pickup_date >= return_date:
            raise serializers.ValidationError("La date de retour doit être après la date de récupération.")
        return data