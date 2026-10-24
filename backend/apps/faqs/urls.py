# ####oussama: FAQ CRUD and swap routes used by the existing frontend.
from rest_framework.routers import DefaultRouter
from .views import FAQViewSet

router = DefaultRouter()
router.register('faqs', FAQViewSet)
urlpatterns = router.urls
