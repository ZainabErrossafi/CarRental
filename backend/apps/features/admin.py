from django.contrib import admin
from .models import Feature


@admin.register(Feature)
class FeatureAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "icon", "name_fr", "name_ar")
    search_fields = ("name", "name_fr", "name_ar")
