from rest_framework import serializers
from .models import Extra


class ExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extra
        fields = [
            "id",
            "icon",
            "name",
            "price_per_day",
            "flat_price",
            "max_qty",
            "active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
