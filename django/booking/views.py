from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Booking, ShopService, ShopAvailability
from .serializers import (
    BookingSerializer,
    BookingListSerializer,
    BookingStatusUpdateSerializer,
    ShopServiceSerializer,
    ShopAvailabilitySerializer,
)


class ShopServiceViewSet(viewsets.ModelViewSet):
    """
    CRUD for Shop Services.

    GET    /api/booking/services/         — list services
    POST   /api/booking/services/         — create service (shop owner)
    GET    /api/booking/services/{id}/    — detail
    PUT    /api/booking/services/{id}/    — update
    PATCH  /api/booking/services/{id}/   — partial update
    DELETE /api/booking/services/{id}/   — delete
    """

    queryset = ShopService.objects.select_related('shop').all()
    serializer_class = ShopServiceSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'shop__name']
    ordering_fields = ['price', 'duration_minutes', 'name']

    def get_queryset(self):
        qs = super().get_queryset().filter(is_active=True)
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            qs = qs.filter(shop_id=shop_id)
        return qs

    def perform_create(self, serializer):
        # Only shop owner can create services for their shop
        user = self.request.user
        if not hasattr(user, 'shop'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must own a shop to add services.")
        serializer.save(shop=user.shop)


class ShopAvailabilityViewSet(viewsets.ModelViewSet):
    """
    Manage shop operating hours.

    GET    /api/booking/availability/        — list schedules
    POST   /api/booking/availability/        — add schedule
    PATCH  /api/booking/availability/{id}/  — update
    DELETE /api/booking/availability/{id}/  — remove
    """

    queryset = ShopAvailability.objects.select_related('shop').all()
    serializer_class = ShopAvailabilitySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        shop_id = self.request.query_params.get('shop')
        if shop_id:
            return qs.filter(shop_id=shop_id)
        return qs


class BookingViewSet(viewsets.ModelViewSet):
    """
    Booking ViewSet.

    Standard routes:
        GET    /api/booking/bookings/              — list bookings
        POST   /api/booking/bookings/              — create booking
        GET    /api/booking/bookings/{id}/         — detail
        PUT    /api/booking/bookings/{id}/         — update
        PATCH  /api/booking/bookings/{id}/         — partial update
        DELETE /api/booking/bookings/{id}/         — cancel/delete

    Custom actions:
        PATCH  /api/booking/bookings/{id}/confirm/         — shop confirms booking
        PATCH  /api/booking/bookings/{id}/cancel/          — customer or shop cancels
        GET    /api/booking/bookings/my_bookings/          — customer's own bookings
        GET    /api/booking/bookings/shop_bookings/        — shop's incoming bookings
    """

    queryset = Booking.objects.select_related(
        'customer', 'shop', 'service'
    ).all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['customer__username', 'shop__name', 'service__name', 'status']
    ordering_fields = ['scheduled_date', 'created_at', 'status']
    ordering = ['-scheduled_date']

    def get_serializer_class(self):
        if self.action == 'list':
            return BookingListSerializer
        if self.action in ['confirm', 'update_status']:
            return BookingStatusUpdateSerializer
        return BookingSerializer

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()

        if user.is_staff:
            return qs
        if hasattr(user, 'shop'):
            return qs.filter(shop=user.shop)
        return qs.filter(customer=user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def destroy(self, request, *args, **kwargs):
        booking = self.get_object()
        if booking.status in ['completed', 'in_progress']:
            return Response(
                {'detail': 'Cannot delete a completed or in-progress booking.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        return Response(
            {'detail': 'Booking cancelled successfully.'},
            status=status.HTTP_200_OK
        )

    # ──────────────────────────────────────────
    # Custom Actions
    # ──────────────────────────────────────────

    @action(detail=True, methods=['patch'])
    def confirm(self, request, pk=None):
        """Shop owner confirms a pending booking."""
        booking = self.get_object()
        if booking.status != 'pending':
            return Response(
                {'detail': 'Only pending bookings can be confirmed.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'confirmed'
        booking.shop_notes = request.data.get('shop_notes', booking.shop_notes)
        booking.save()
        serializer = BookingSerializer(booking, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['patch'])
    def cancel(self, request, pk=None):
        """Cancel a booking (customer or shop)."""
        booking = self.get_object()
        if booking.status in ['completed', 'cancelled']:
            return Response(
                {'detail': f'Booking is already {booking.status}.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        return Response({'detail': 'Booking cancelled.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my_bookings')
    def my_bookings(self, request):
        """Get all bookings made by the current user."""
        bookings = Booking.objects.filter(customer=request.user).order_by('-scheduled_date')
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = BookingListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(BookingListSerializer(bookings, many=True).data)

    @action(detail=False, methods=['get'], url_path='shop_bookings')
    def shop_bookings(self, request):
        """Get all bookings for the authenticated user's shop."""
        if not hasattr(request.user, 'shop'):
            return Response(
                {'detail': 'You do not own a shop.'},
                status=status.HTTP_403_FORBIDDEN
            )
        bookings = Booking.objects.filter(shop=request.user.shop).order_by('-scheduled_date')
        page = self.paginate_queryset(bookings)
        if page is not None:
            serializer = BookingListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        return Response(BookingListSerializer(bookings, many=True).data)