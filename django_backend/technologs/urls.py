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
    path('shop/', include('shop.urls')),       # removed api/ prefix
    path('repair/', include('repair.urls')),   # removed api/ prefix
    path('booking/', include('booking.urls')), # removed api/ prefix
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)