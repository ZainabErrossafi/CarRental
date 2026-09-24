from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.reservations.urls')),
    path('api/', include('apps.reviews.urls')),
    path('api/', include('apps.notifications.urls')),
]