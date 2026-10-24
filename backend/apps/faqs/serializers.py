# ####oussama: Validate FAQ content and protect server-managed ordering.
from rest_framework import serializers
from .models import FAQ


class FAQSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQ
        fields = ['id', 'question', 'answer', 'active', 'order']
        read_only_fields = ['id', 'order']
