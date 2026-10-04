from django.db import models


class Location(models.Model):
    name = models.CharField(max_length=150)
    name_fr = models.CharField(max_length=150, blank=True)
    name_ar = models.CharField(max_length=150, blank=True)
    city = models.CharField(max_length=100)
    country = models.CharField(max_length=100)
    active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.city})"