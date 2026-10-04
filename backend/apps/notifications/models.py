from django.db import models
from django.conf import settings
from django.utils import timezone


class NotificationType(models.TextChoices):
    RESERVATION_CONFIRMED = 'reservation_confirmed', 'Reservation confirmed'
    RESERVATION_CANCELLED = 'reservation_cancelled', 'Reservation cancelled'
    PICKUP_REMINDER = 'pickup_reminder', 'Pickup reminder'
    RETURN_REMINDER = 'return_reminder', 'Return reminder'
    PAYMENT_RECEIVED = 'payment_received', 'Payment received'
    REVIEW_REQUEST = 'review_request', 'Review request'


class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')

    type = models.CharField(max_length=30, choices=NotificationType.choices)
    title = models.CharField(max_length=150)
    message = models.TextField()

    related_id = models.BigIntegerField(null=True, blank=True)
    related_type = models.CharField(max_length=50, blank=True)

    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()

    def __str__(self):
        return f"{self.title} ({self.user})"