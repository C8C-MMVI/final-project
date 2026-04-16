from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Shop


class OwnerSerializer(serializers.ModelSerializer):
    """Nested serializer for the shop owner (read-only)."""

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = fields


class ShopSerializer(serializers.ModelSerializer):
    """
    Full serializer for Shop — used for create/update.
    Owner is set automatically from the authenticated request user.
    """
    owner = OwnerSerializer(read_only=True)
    status_display = serializers.CharField(
        source='get_status_display',
        read_only=True
    )

    class Meta:
        model = Shop
        fields = [
            'id', 'owner', 'name', 'description', 'address',
            'phone', 'email', 'logo', 'status', 'status_display',
            'is_verified', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'owner', 'is_verified', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Automatically assign the logged-in user as owner
        request = self.context.get('request')
        validated_data['owner'] = request.user
        return super().create(validated_data)


class ShopListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views."""
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Shop
        fields = ['id', 'name', 'address', 'phone', 'status', 'owner_name', 'created_at']

    def get_owner_name(self, obj):
        return obj.owner.get_full_name() or obj.owner.username