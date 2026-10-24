from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.users.serializers import AdminTokenObtainPairSerializer
from apps.users.views import SignupView, google_callback_redirect  # ####oussama: Sign-up view.
from apps.users.views_2fa import EmailLoginView, TwoFactorToggleView, TwoFactorResendView, TwoFactorVerifyView

urlpatterns = [
    # Health & Admin
    path('api/health/', lambda request: JsonResponse({'status': 'ok'})),
    path('admin/', admin.site.urls),

    # Authentication & OAuth
    path('api/auth/2fa/toggle/', TwoFactorToggleView.as_view(), name='two_factor_toggle'),
    path('api/auth/2fa/resend/', TwoFactorResendView.as_view(), name='two_factor_resend'),
    path('api/auth/2fa/verify/', TwoFactorVerifyView.as_view(), name='two_factor_verify'),
    # ####oussama: Public account registration route.
    path('api/auth/signup/', SignupView.as_view(), name='signup'),
    path('api/auth/', include('dj_rest_auth.urls')),
    # path('api/auth/google/', GoogleLoginView.as_view(), name='google_login'),
    path('api/accounts/', include('allauth.urls')),
    path('api/token/', EmailLoginView.as_view(serializer_class=AdminTokenObtainPairSerializer), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/google/success/', google_callback_redirect, name='google_auth_success'),##oussama

    # Apps
    # ####oussama: Connect public and admin FAQ endpoints.
    path('api/', include('apps.faqs.urls')),
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
