from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .docs import openapi_schema, public_api_docs
from .views import (
    PublicBrandViewSet,
    PublicCategoryViewSet,
    PublicFAQViewSet,
    PublicLocationViewSet,
    PublicVehicleViewSet,
)

router = DefaultRouter()
router.register('vehicles', PublicVehicleViewSet, basename='public-vehicle')
router.register('brands', PublicBrandViewSet, basename='public-brand')
router.register('categories', PublicCategoryViewSet, basename='public-category')
router.register('locations', PublicLocationViewSet, basename='public-location')
router.register('faqs', PublicFAQViewSet, basename='public-faq')

urlpatterns = [
    path('docs/', public_api_docs, name='public-api-docs'),
    path('openapi.json', openapi_schema, name='public-api-openapi'),
    path('', include(router.urls)),
]
