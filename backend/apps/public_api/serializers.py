from rest_framework import serializers

from apps.brands.models import Brand
from apps.categories.models import Category
from apps.features.models import Feature
from apps.locations.models import Location
from apps.vehicles.models import Vehicle


class PublicVehicleSerializer(serializers.ModelSerializer):
    brand_name = serializers.CharField(source='brand.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    home_location_name = serializers.CharField(source='home_location.name', read_only=True, allow_null=True)
    feature_names = serializers.SlugRelatedField(
        source='features', slug_field='name', many=True, read_only=True,
    )
    brand_id = serializers.PrimaryKeyRelatedField(
        source='brand', queryset=Brand.objects.all(), write_only=True,
    )
    category_id = serializers.PrimaryKeyRelatedField(
        source='category', queryset=Category.objects.all(), write_only=True,
    )
    home_location_id = serializers.PrimaryKeyRelatedField(
        source='home_location', queryset=Location.objects.all(),
        write_only=True, required=False, allow_null=True,
    )
    feature_ids = serializers.PrimaryKeyRelatedField(
        source='features', queryset=Feature.objects.all(),
        many=True, write_only=True, required=False,
    )

    class Meta:
        model = Vehicle
        fields = [
            'id', 'brand_name', 'brand_id', 'category_name', 'category_id',
            'home_location_name', 'home_location_id', 'feature_names', 'feature_ids',
            'model', 'year', 'status', 'is_featured', 'transmission', 'fuel',
            'seats', 'doors', 'luggage', 'air_conditioning', 'daily_rate', 'deposit',
            'daily_mileage_limit', 'min_driver_age', 'min_license_years',
            'main_image', 'description_en', 'description_fr', 'description_ar',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
