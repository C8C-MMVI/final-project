from django.db import models
from django.contrib.auth.models import User
from shop.models import Shop


class RepairRequest(models.Model):
    """
    A customer's repair request submitted to a shop.
    Tracks the lifecycle from submission to completion.
    """

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('in_progress', 'In Progress'),
        ('waiting_parts', 'Waiting for Parts'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    DEVICE_TYPE_CHOICES = [
        ('laptop', 'Laptop'),
        ('desktop', 'Desktop'),
        ('phone', 'Phone'),
        ('tablet', 'Tablet'),
        ('printer', 'Printer'),
        ('other', 'Other'),
    ]

    # Relations
    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='repair_requests'
    )
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='repair_requests'
    )
    assigned_technician = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_repairs'
    )

    # Device info
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPE_CHOICES)
    device_brand = models.CharField(max_length=100)
    device_model = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100, blank=True, null=True)

    # Request details
    issue_description = models.TextField()
    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='medium'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    # Pricing
    estimated_cost = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    final_cost = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True
    )

    # Notes
    technician_notes = models.TextField(blank=True, null=True)
    customer_notes = models.TextField(blank=True, null=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Repair Request'
        verbose_name_plural = 'Repair Requests'

    def __str__(self):
        return f"#{self.id} - {self.device_brand} {self.device_model} ({self.status})"