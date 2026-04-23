from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django.shortcuts import get_object_or_404

from .models import Shop
from .serializers import ShopSerializer, ShopListSerializer


class ShopViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Shop CRUD operations.

    list:        GET  /api/shop/shops/          — list all shops
    create:      POST /api/shop/shops/          — create a shop
    retrieve:    GET  /api/shop/shops/{id}/     — get single shop
    update:      PUT  /api/shop/shops/{id}/     — full update
    partial_update: PATCH /api/shop/shops/{id}/ — partial update
    destroy:     DELETE /api/shop/shops/{id}/  — delete shop

    Custom actions:
    my_shop:     GET  /api/shop/shops/my_shop/  — get current user's shop
    verify:      POST /api/shop/shops/{id}/verify/ — admin verify a shop
    """

    queryset = Shop.objects.select_related('owner').all()
    serializer_class = ShopSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'address', 'email', 'owner__username']
    ordering_fields = ['created_at', 'name', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        """Use lightweight serializer for list action."""
        if self.action == 'list':
            return ShopListSerializer
        return ShopSerializer

    def get_permissions(self):
        """
        - list/retrieve: anyone authenticated
        - create: authenticated users
        - update/delete: owner or admin
        - verify: admin only
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        elif self.action == 'verify':
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        """Non-admin users only see active/verified shops in list."""
        qs = super().get_queryset()
        user = self.request.user
        if not user.is_staff:
            # Show all own shop regardless of status, but only active others
            return qs.filter(status='active') | qs.filter(owner=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def update(self, request, *args, **kwargs):
        """Only the owner or admin can update."""
        shop = self.get_object()
        if shop.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to edit this shop.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        """Only the owner or admin can delete."""
        shop = self.get_object()
        if shop.owner != request.user and not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to delete this shop.'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().destroy(request, *args, **kwargs)

    # ──────────────────────────────────────────
    # Custom Actions
    # ──────────────────────────────────────────

    @action(detail=False, methods=['get'], url_path='my_shop')
    def my_shop(self, request):
        """Return the authenticated user's shop."""
        shop = get_object_or_404(Shop, owner=request.user)
        serializer = self.get_serializer(shop)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def verify(self, request, pk=None):
        """Admin action to verify/approve a shop."""
        shop = self.get_object()
        shop.is_verified = True
        shop.status = 'active'
        shop.save()
        return Response(
            {'detail': f'Shop "{shop.name}" has been verified and activated.'},
            status=status.HTTP_200_OK
        )