from django.db import models


class Extra(models.Model):
    icon = models.CharField(max_length=50, blank=True)  # icon name, e.g. "baby-seat"
    name = models.CharField(max_length=100, unique=True)
    price_per_day = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    flat_price = models.DecimalField(max_digits=8, decimal_places=2, default=0)  # one-time fee
    max_qty = models.PositiveSmallIntegerField(default=1)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
