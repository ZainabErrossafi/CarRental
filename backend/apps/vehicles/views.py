from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Vehicle
from .serializers import VehicleDetailSerializer, VehicleListSerializer


class VehicleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == "list":
            return VehicleListSerializer
        return VehicleDetailSerializer

    def get_queryset(self):
        queryset = Vehicle.objects.select_related("brand", "category", "home_location").prefetch_related("features", "gallery")

        # Query parameter filtering
        brand = self.request.query_params.get("brand")
        category = self.request.query_params.get("category")
        status = self.request.query_params.get("status")
        transmission = self.request.query_params.get("transmission")
        fuel = self.request.query_params.get("fuel")
        is_featured = self.request.query_params.get("is_featured")
        min_rate = self.request.query_params.get("min_rate")
        max_rate = self.request.query_params.get("max_rate")

        if brand:
            queryset = queryset.filter(brand_id=brand)
        if category:
            queryset = queryset.filter(category_id=category)
        if status:
            queryset = queryset.filter(status=status)
        if transmission:
            queryset = queryset.filter(transmission=transmission)
        if fuel:
            queryset = queryset.filter(fuel=fuel)
        if is_featured is not None:
            queryset = queryset.filter(is_featured=is_featured.lower() == "true")
        if min_rate:
            queryset = queryset.filter(daily_rate__gte=min_rate)
        if max_rate:
            queryset = queryset.filter(daily_rate__lte=max_rate)

        return queryset
