from rest_framework import serializers
from django.contrib.auth.models import User
from django.utils import timezone
from .models import RepairRequest


class UserBriefSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'email']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class RepairRequestSerializer(serializers.ModelSerializer):
    """Full serializer — used for create and detail view."""
    customer = UserBriefSerializer(read_only=True)
    assigned_technician = UserBriefSerializer(read_only=True)
    assigned_technician_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='assigned_technician',
        write_only=True,
        required=False,
        allow_null=True
    )

    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    device_type_display = serializers.CharField(source='get_device_type_display', read_only=True)

    class Meta:
        model = RepairRequest
        fields = [
            'id', 'customer', 'shop',
            'assigned_technician', 'assigned_technician_id',
            'device_type', 'device_type_display',
            'device_brand', 'device_model', 'serial_number',
            'issue_description', 'customer_notes',
            'priority', 'priority_display',
            'status', 'status_display',
            'estimated_cost', 'final_cost',
            'technician_notes',
            'created_at', 'updated_at', 'completed_at',
        ]
        read_only_fields = [
            'id', 'customer', 'created_at', 'updated_at', 'completed_at',
            'status_display', 'priority_display', 'device_type_display',
        ]

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['customer'] = request.user
        return super().create(validated_data)


class RepairRequestListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    customer_name = serializers.SerializerMethodField()
    shop_name = serializers.CharField(source='shop.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    device_summary = serializers.SerializerMethodField()

    class Meta:
        model = RepairRequest
        fields = [
            'id', 'customer_name', 'shop_name', 'device_summary',
            'status', 'status_display', 'priority', 'estimated_cost',
            'created_at',
        ]

    def get_customer_name(self, obj):
        return obj.customer.get_full_name() or obj.customer.username

    def get_device_summary(self, obj):
        return f"{obj.device_brand} {obj.device_model} ({obj.get_device_type_display()})"


class RepairStatusUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating status and technician notes only."""

    class Meta:
        model = RepairRequest
        fields = ['status', 'technician_notes', 'estimated_cost', 'final_cost', 'assigned_technician']

    def validate_status(self, value):
        instance = self.instance
        if instance and instance.status == 'completed' and value != 'completed':
            raise serializers.ValidationError("Cannot change status of a completed repair.")
        return value

    def update(self, instance, validated_data):
        # Auto-set completed_at when status transitions to completed
        if validated_data.get('status') == 'completed' and instance.status != 'completed':
            validated_data['completed_at'] = timezone.now()
        return super().update(instance, validated_data)