from rest_framework import serializers
from apps.brands.serializers import BrandSerializer
from apps.categories.serializers import CategorySerializer
from apps.features.serializers import FeatureSerializer
from .models import Vehicle, VehicleImage
from apps.features.models import Feature


class VehicleImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VehicleImage
        fields = ["id", "image", "alt_text", "order", "created_at"]


class VehicleListSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "brand",
            "category",
            "model",
            "year",
            "status",
            "is_featured",
            "transmission",
            "fuel",
            "seats",
            "doors",
            "luggage",
            "air_conditioning",
            "daily_rate",
            "deposit",
            "main_image",
        ]


class VehicleDetailSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    features = FeatureSerializer(many=True, read_only=True)
    gallery = VehicleImageSerializer(many=True, read_only=True)

    # Write-only ID fields for POST/PUT/PATCH requests
    brand_id = serializers.IntegerField(write_only=True)
    category_id = serializers.IntegerField(write_only=True)
    feature_ids = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Feature.objects.all(), write_only=True, source="features", required=False
    )

    class Meta:
        model = Vehicle
        fields = [
            "id",
            "brand",
            "brand_id",
            "category",
            "category_id",
            "home_location",
            "features",
            "feature_ids",
            "gallery",
            "model",
            "year",
            "status",
            "is_featured",
            "transmission",
            "fuel",
            "seats",
            "doors",
            "luggage",
            "air_conditioning",
            "daily_rate",
            "deposit",
            "daily_mileage_limit",
            "min_driver_age",
            "min_license_years",
            "main_image",
            "description_en",
            "description_fr",
            "description_ar",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
