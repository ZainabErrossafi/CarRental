from django.db import models


class Category(models.Model):
    icon = models.CharField(max_length=50, blank=True)  # icon name, e.g. "suv"
    name = models.CharField(max_length=100, unique=True)  # English
    name_fr = models.CharField(max_length=100, blank=True)
    name_ar = models.CharField(max_length=100, blank=True)
    order = models.PositiveIntegerField(default=0)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["order", "name"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name