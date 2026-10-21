from django.contrib import admin
from .models import Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "icon", "order", "active", "created_at")
    list_filter = ("active",)
    search_fields = ("name", "name_fr", "name_ar")
    list_editable = ("order", "active")