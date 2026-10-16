from django.contrib import admin
from .models import Extra


@admin.register(Extra)
class ExtraAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "price_per_day",
        "flat_price",
        "max_qty",
        "active",
        "created_at",
    )
    list_filter = ("active",)
    search_fields = ("name",)
    list_editable = ("active",)
