from django.db import models
from django.conf import settings


class ReservationStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    CONFIRMED = 'confirmed', 'Confirmed'
    COMPLETED = 'completed', 'Completed'
    CANCELLED = 'cancelled', 'Cancelled'


class Reservation(models.Model):
    reference = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=10, choices=ReservationStatus.choices, default=ReservationStatus.PENDING)

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    vehicle = models.ForeignKey('vehicles.Vehicle', on_delete=models.CASCADE, related_name='reservations')
    pickup_location = models.ForeignKey('locations.Location', on_delete=models.PROTECT, related_name='pickups')
    dropoff_location = models.ForeignKey('locations.Location', on_delete=models.PROTECT, related_name='dropoffs')

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


class ReservationExtra(models.Model):
    reservation = models.ForeignKey(Reservation, on_delete=models.CASCADE, related_name='reservation_extras')
    extra = models.ForeignKey('extras.Extra', on_delete=models.PROTECT, related_name='reservation_extras')
    quantity = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ('reservation', 'extra')

    def __str__(self):
        return f"{self.extra} x{self.quantity} ({self.reservation.reference})"