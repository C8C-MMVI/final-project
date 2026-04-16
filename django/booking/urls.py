from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookingViewSet, ShopServiceViewSet, ShopAvailabilityViewSet

router = DefaultRouter()
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'services', ShopServiceViewSet, basename='shop-service')
router.register(r'availability', ShopAvailabilityViewSet, basename='shop-availability')

urlpatterns = [
    path('', include(router.urls)),
]