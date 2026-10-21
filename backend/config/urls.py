from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.users.serializers import AdminTokenObtainPairSerializer
from apps.users.views import GoogleLoginView

urlpatterns = [
    # Health & Admin
    path('api/health/', lambda request: JsonResponse({'status': 'ok'})),
    path('admin/', admin.site.urls),

    # Authentication & OAuth
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('api/accounts/', include('allauth.urls')),
    path('api/token/', TokenObtainPairView.as_view(serializer_class=AdminTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Apps
    path('api/', include('apps.reservations.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.notifications.urls')),
    path('api/', include('apps.locations.urls')),
    path('api/', include('apps.users.urls')),
    path('api/brands/', include('apps.brands.urls')),
    path('api/categories/', include('apps.categories.urls')),
    path('api/features/', include('apps.features.urls')),
    path('api/extras/', include('apps.extras.urls')),
    path('api/vehicles/', include('apps.vehicles.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)