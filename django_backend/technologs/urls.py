from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.authtoken.views import obtain_auth_token
from accounts.views import get_or_create_token

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', obtain_auth_token, name='api_token_auth'),
    path('api/auth/bridge/', get_or_create_token, name='bridge_token'),
    path('api/shop/', include('shop.urls')),
    path('api/repair/', include('repair.urls')),
    path('api/booking/', include('booking.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)