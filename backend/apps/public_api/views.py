from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from apps.brands.models import Brand
from apps.brands.serializers import BrandSerializer
from apps.categories.models import Category
from apps.categories.serializers import CategorySerializer
from apps.faqs.models import FAQ
from apps.faqs.serializers import FAQSerializer
from apps.locations.models import Location
from apps.locations.serializers import LocationSerializer
from apps.vehicles.models import Vehicle
from .authentication import PublicAPIKeyAuthentication
from .serializers import PublicVehicleSerializer
from .throttling import PublicAPIKeyThrottle


class PublicAPIBaseViewSet:
    authentication_classes = [PublicAPIKeyAuthentication]
    permission_classes = [IsAuthenticated]
    throttle_classes = [PublicAPIKeyThrottle]


class PublicVehicleViewSet(PublicAPIBaseViewSet, ModelViewSet):
    queryset = Vehicle.objects.select_related(
        'brand', 'category', 'home_location',
    ).prefetch_related('features')
    serializer_class = PublicVehicleSerializer
    parser_classes = [JSONParser, FormParser, MultiPartParser]
    filterset_fields = ['brand', 'category', 'status', 'fuel', 'transmission']
    search_fields = ['model', 'brand__name', 'category__name']
    ordering_fields = ['year', 'daily_rate', 'created_at']
    ordering = ['-created_at']


class PublicBrandViewSet(PublicAPIBaseViewSet, ReadOnlyModelViewSet):
    queryset = Brand.objects.order_by('name')
    serializer_class = BrandSerializer


class PublicCategoryViewSet(PublicAPIBaseViewSet, ReadOnlyModelViewSet):
    queryset = Category.objects.filter(active=True)
    serializer_class = CategorySerializer


class PublicLocationViewSet(PublicAPIBaseViewSet, ReadOnlyModelViewSet):
    queryset = Location.objects.filter(active=True).order_by('name')
    serializer_class = LocationSerializer


class PublicFAQViewSet(PublicAPIBaseViewSet, ReadOnlyModelViewSet):
    queryset = FAQ.objects.filter(active=True)
    serializer_class = FAQSerializer
