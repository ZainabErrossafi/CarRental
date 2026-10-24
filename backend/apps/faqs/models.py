# ####oussama: Persist FAQ content, publication status, and display order.
from django.db import models


class FAQ(models.Model):
    question = models.CharField(max_length=300)
    answer = models.TextField()
    active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    def __str__(self):
        return self.question
