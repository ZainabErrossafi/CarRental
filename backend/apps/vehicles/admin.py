from django.contrib import admin
from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "brand",
        "model",
        "year",
        "status",
        "daily_rate",
        "is_featured",
    )
    list_filter = ("status", "brand", "category", "transmission", "fuel", "is_featured")
    search_fields = ("model", "brand__name")
