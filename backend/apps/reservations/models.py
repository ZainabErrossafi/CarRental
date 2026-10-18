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

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations', null=True, blank=True)
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

    def duration_days(self):
        delta = self.return_date - self.pickup_date
        days = delta.days + (1 if delta.seconds > 0 else 0)
        return max(days, 1)
    
    def calculate_total(self):
        vehicle_cost = self.vehicle.daily_rate * self.duration_days()

        extras_cost = 0
        for reservation_extra in self.reservation_extras.all():
            extra = reservation_extra.extra
            if extra.price_per_day:
                extras_cost += extra.price_per_day * self.duration_days() * reservation_extra.quantity
            if extra.flat_price:
                extras_cost += extra.flat_price * reservation_extra.quantity

        return vehicle_cost + extras_cost
    
    def confirm(self):
        self.status = ReservationStatus.CONFIRMED
        self.save()
        self._notify('reservation_confirmed', 'Reservation confirmed', f"Your reservation {self.reference} has been confirmed.")

    def cancel(self, by=None):
        self.status = ReservationStatus.CANCELLED
        self.save()
        self._notify('reservation_cancelled', 'Reservation cancelled', f"Your reservation {self.reference} has been cancelled.")
        if by is not None and not by.is_admin():
            self.notify_admins('reservation_cancelled', 'Reservation cancelled by client', f"Reservation {self.reference} was cancelled by the client.")

    def notify_admins(self, notif_type, title, message):
        from apps.notifications.models import Notification
        from apps.users.models import User, Role
        admins = User.objects.filter(role=Role.ADMIN, is_active=True)
        Notification.objects.bulk_create([
            Notification(
                user=admin,
                type=notif_type,
                title=title,
                message=message,
                related_id=self.id,
                related_type='reservation',
            )
            for admin in admins
        ])
        
    def complete(self):
        self.status = ReservationStatus.COMPLETED
        self.save()
        self._notify('review_request', 'How was your rental?', f"Leave a review for your reservation {self.reference}.")

    def _notify(self, notif_type, title, message):
        if self.user_id is None:
            return
        from apps.notifications.models import Notification
        Notification.objects.create(
            user=self.user,
            type=notif_type,
            title=title,
            message=message,
            related_id=self.id,
            related_type='reservation',
        )
          
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