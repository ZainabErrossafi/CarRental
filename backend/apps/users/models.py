from django.contrib.auth.models import AbstractUser
from django.db import models


class Role(models.TextChoices):
    ADMIN = 'admin', 'Admin'
    CLIENT = 'client', 'Client'


class User(AbstractUser):
    phone = models.CharField(max_length=20, blank=True)
    role = models.CharField(max_length=10, choices=Role.choices, default=Role.CLIENT)

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def is_admin(self):
        return self.role == Role.ADMIN

    def __str__(self):
        return self.email or self.username