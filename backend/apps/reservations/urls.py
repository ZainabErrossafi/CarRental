from rest_framework.routers import DefaultRouter
from .views import ReservationViewSet, ReservationExtraViewSet

router = DefaultRouter()
router.register('reservations', ReservationViewSet)
router.register('reservation-extras', ReservationExtraViewSet)

urlpatterns = router.urls