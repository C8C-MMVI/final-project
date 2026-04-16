from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import RepairRequest
from .serializers import (
    RepairRequestSerializer,
    RepairRequestListSerializer,
    RepairStatusUpdateSerializer,
)


class RepairRequestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Repair Requests.

    Standard routes:
        GET    /api/repair/requests/         — list repair requests
        POST   /api/repair/requests/         — submit new repair request
        GET    /api/repair/requests/{id}/    — get repair detail
        PUT    /api/repair/requests/{id}/    — full update
        PATCH  /api/repair/requests/{id}/   — partial update
        DELETE /api/repair/requests/{id}/   — delete

    Custom actions:
        PATCH  /api/repair/requests/{id}/update_status/ — update status + notes
        GET    /api/repair/requests/my_requests/        — customer's own repairs
        GET    /api/repair/requests/shop_requests/      — all repairs for user's shop
    """

    queryset = RepairRequest.objects.select_related(
        'customer', 'shop', 'assigned_technician'
    ).all()
    serializer_class = RepairRequestSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['device_brand', 'device_model', 'customer__username', 'status']
    ordering_fields = ['created_at', 'priority', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return RepairRequestListSerializer
        if self.action == 'update_status':
            return RepairStatusUpdateSerializer
        return RepairRequestSerializer

    def get_queryset(self):
        """
        Filter results based on role:
        - Admin/Staff: see all
        - Shop owner / technician: see their shop's requests
        - Customer: see only their own requests
        """
        user = self.request.user
        qs = super().get_queryset()

        if user.is_staff:
            return qs

        # If user has a shop (owner), see all shop requests
        if hasattr(user, 'shop'):
            return qs.filter(shop=user.shop)

        # Regular customer: only own requests
        return qs.filter(customer=user)

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def destroy(self, request, *args, **kwargs):
        repair = self.get_object()
        if repair.status not in ['pending', 'rejected', 'cancelled']:
            return Response(
                {'detail': 'Only pending/rejected/cancelled requests can be deleted.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        return super().destroy(request, *args, **kwargs)

    # ──────────────────────────────────────────
    # Custom Actions
    # ──────────────────────────────────────────

    @action(detail=True, methods=['patch'], url_path='update_status')
    def update_status(self, request, pk=None):
        """
        Shop owner or technician updates the repair status/notes.
        PATCH /api/repair/requests/{id}/update_status/
        Body: { "status": "in_progress", "technician_notes": "..." }
        """
        repair = self.get_object()
        serializer = RepairStatusUpdateSerializer(
            repair, data=request.data, partial=True, context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my_requests')
    def my_requests(self, request):
        """Return all repair requests submitted by the current user."""
        repairs = RepairRequest.objects.filter(customer=request.user).order_by('-created_at')
        page = self.paginate_queryset(repairs)
        if page is not None:
            serializer = RepairRequestListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = RepairRequestListSerializer(repairs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='shop_requests')
    def shop_requests(self, request):
        """Return all repair requests for the authenticated user's shop."""
        if not hasattr(request.user, 'shop'):
            return Response(
                {'detail': 'You do not own a shop.'},
                status=status.HTTP_403_FORBIDDEN
            )
        repairs = RepairRequest.objects.filter(shop=request.user.shop).order_by('-created_at')
        page = self.paginate_queryset(repairs)
        if page is not None:
            serializer = RepairRequestListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = RepairRequestListSerializer(repairs, many=True)
        return Response(serializer.data)