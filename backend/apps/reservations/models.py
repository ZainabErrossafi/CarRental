from django.conf import settings
from django.db import models
from django.db.models import F, Q


class ReservationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'


class Reservation(models.Model):
    reference = models.CharField(max_length=20, unique=True)
    status = models.CharField(
        max_length=20,
        choices=ReservationStatus.choices,
        default=ReservationStatus.PENDING,
        db_index=True,
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='reservations'
    )
    vehicle = models.ForeignKey(
        'vehicles.Vehicle', on_delete=models.PROTECT, related_name='reservations'
    )
    pickup_location = models.ForeignKey(
        'locations.Location', on_delete=models.PROTECT, related_name='pickups'
    )
    dropoff_location = models.ForeignKey(
        'locations.Location', on_delete=models.PROTECT, related_name='dropoffs'
    )
    extras = models.ManyToManyField(
        'extras.Extra', blank=True, related_name='reservations'
    )

    driver_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    pickup_date = models.DateTimeField()
    return_date = models.DateTimeField()

    total_price = models.DecimalField(max_digits=10, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.reference