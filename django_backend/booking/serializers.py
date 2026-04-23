from rest_framework import serializers
from django.utils import timezone
from .models import Booking, ShopService, ShopAvailability


class ShopServiceSerializer(serializers.ModelSerializer):
    """Serializer for services offered by a shop."""
    shop_name = serializers.CharField(source='shop.name', read_only=True)

    class Meta:
        model = ShopService
        fields = [
            'id', 'shop', 'shop_name', 'name', 'description',
            'duration_minutes', 'price', 'is_active', 'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class ShopAvailabilitySerializer(serializers.ModelSerializer):
    """Serializer for shop operating hours."""
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = ShopAvailability
        fields = [
            'id', 'shop', 'day_of_week', 'day_name',
            'open_time', 'close_time', 'is_available',
        ]
        read_only_fields = ['id']

    def validate(self, data):
        if data.get('open_time') and data.get('close_time'):
            if data['open_time'] >= data['close_time']:
                raise serializers.ValidationError(
                    "Close time must be after open time."
                )
        return data


class BookingSerializer(serializers.ModelSerializer):
    """Full booking serializer for create/detail."""
    customer_name = serializers.SerializerMethodField()
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'customer_name',
            'shop', 'shop_name',
            'service', 'service_name',
            'scheduled_date', 'scheduled_time',
            'status', 'status_display',
            'customer_notes', 'shop_notes',
            'total_price',
            'created_at', 'updated_at',
        ]
        read_only_fields = [
            'id', 'customer', 'customer_name', 'total_price',
            'created_at', 'updated_at', 'status_display',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def validate_scheduled_date(self, value):
        if value < timezone.now().date():
            raise serializers.ValidationError("Cannot book a date in the past.")
        return value

    def validate(self, data):
        """Check the service belongs to the chosen shop."""
        service = data.get('service')
        shop = data.get('shop')
        if service and shop and service.shop != shop:
            raise serializers.ValidationError(
                "The selected service does not belong to the selected shop."
            )
        if service and not service.is_active:
            raise serializers.ValidationError("This service is currently unavailable.")
        return data

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['customer'] = request.user
        # Snapshot price
        validated_data['total_price'] = validated_data['service'].price
        return super().create(validated_data)


class BookingListSerializer(serializers.ModelSerializer):
    """Compact serializer for list views."""
    customer_name = serializers.SerializerMethodField()
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    service_name = serializers.CharField(source='service.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer_name', 'shop_name', 'service_name',
            'scheduled_date', 'scheduled_time',
            'status', 'status_display', 'total_price', 'created_at',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username


class BookingStatusUpdateSerializer(serializers.ModelSerializer):
    """Used by shop to update booking status and add notes."""

    class Meta:
        model = Booking
        fields = ['status', 'shop_notes']