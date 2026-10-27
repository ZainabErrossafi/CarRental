from django.core.validators import MinValueValidator
from django.db import models


class Vehicle(models.Model):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        MAINTENANCE = "maintenance", "Maintenance"
        HIDDEN = "hidden", "Hidden"

    class Transmission(models.TextChoices):
        MANUAL = "manual", "Manual"
        AUTOMATIC = "automatic", "Automatic"

    class Fuel(models.TextChoices):
        PETROL = "petrol", "Petrol"
        DIESEL = "diesel", "Diesel"
        HYBRID = "hybrid", "Hybrid"
        ELECTRIC = "electric", "Electric"

    # Relations
    brand = models.ForeignKey(
        "brands.Brand", on_delete=models.PROTECT, related_name="vehicles"
    )
    category = models.ForeignKey(
        "categories.Category", on_delete=models.PROTECT, related_name="vehicles"
    )
    home_location = models.ForeignKey(
        "locations.Location",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="vehicles",
    )
    features = models.ManyToManyField(
        "features.Feature", blank=True, related_name="vehicles"
    )

    # Identity
    model = models.CharField(max_length=100)
    year = models.PositiveSmallIntegerField(validators=[MinValueValidator(1990)])
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.AVAILABLE, db_index=True
    )
    is_featured = models.BooleanField(default=False)

    # Specs
    transmission = models.CharField(max_length=20, choices=Transmission.choices)
    fuel = models.CharField(max_length=20, choices=Fuel.choices)
    seats = models.PositiveSmallIntegerField()
    doors = models.PositiveSmallIntegerField()
    luggage = models.PositiveSmallIntegerField(default=0)
    air_conditioning = models.BooleanField(default=True)

    # Pricing & rental conditions
    daily_rate = models.DecimalField(max_digits=8, decimal_places=2)
    deposit = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    daily_mileage_limit = models.PositiveIntegerField(null=True, blank=True)  # null = unlimited
    min_driver_age = models.PositiveSmallIntegerField(default=21)
    min_license_years = models.PositiveSmallIntegerField(default=1)

    # Media & descriptions
    main_image = models.ImageField(upload_to="vehicles/main/", blank=True, null=True)
    description_en = models.TextField(blank=True)
    description_fr = models.TextField(blank=True)
    description_ar = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.brand} {self.model} ({self.year})"

    def is_available(self, start, end, exclude_reservation_id=None):
      from apps.reservations.models import ReservationStatus

      if start >= end:
          return False

      if self.status != self.Status.AVAILABLE:
          return False

      reservations = self.reservations.filter(
          status__in=[
              ReservationStatus.PENDING,
              ReservationStatus.CONFIRMED,
          ],
          pickup_date__lt=end,
          return_date__gt=start,
      )

      if exclude_reservation_id is not None:
          reservations = reservations.exclude(pk=exclude_reservation_id)

      return not reservations.exists()


class VehicleImage(models.Model):
    vehicle = models.ForeignKey(
        Vehicle, on_delete=models.CASCADE, related_name="gallery"
    )
    image = models.ImageField(upload_to="vehicles/gallery/")
    alt_text = models.CharField(max_length=255, blank=True)
    order = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order", "created_at"]

    def __str__(self):
        return f"Image for {self.vehicle.model} (Order: {self.order})"