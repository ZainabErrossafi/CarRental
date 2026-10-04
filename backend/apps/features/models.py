from django.db import models


class Feature(models.Model):
    icon = models.CharField(max_length=50, blank=True)  # icon name, e.g. "bluetooth"
    name = models.CharField(max_length=100, unique=True)  # English
    name_fr = models.CharField(max_length=100, blank=True)
    name_ar = models.CharField(max_length=100, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name