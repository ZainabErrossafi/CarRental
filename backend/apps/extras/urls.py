from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import ExtraViewSet

router = DefaultRouter()
router.register(r"", ExtraViewSet, basename="extra")

urlpatterns = [
    path("", include(router.urls)),
]
