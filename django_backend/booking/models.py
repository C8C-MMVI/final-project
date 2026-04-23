from django.db import models
from django.contrib.auth.models import User
from shop.models import Shop


class ShopService(models.Model):
    """Services offered by a shop (e.g., Screen Repair, Data Recovery)."""

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='services'
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(
        help_text="Estimated duration in minutes"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} @ {self.shop.name} (₱{self.price})"


class ShopAvailability(models.Model):
    """
    Defines a shop's working hours per day of week.
    E.g. Monday 08:00–17:00
    """
    DAY_CHOICES = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    ]

    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='availability'
    )
    day_of_week = models.IntegerField(choices=DAY_CHOICES)
    open_time = models.TimeField()
    close_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    class Meta:
        unique_together = ('shop', 'day_of_week')
        ordering = ['day_of_week']

    def __str__(self):
        day = dict(self.DAY_CHOICES).get(self.day_of_week, 'Unknown')
        return f"{self.shop.name} — {day} ({self.open_time}–{self.close_time})"


class Booking(models.Model):
    """A customer booking for a specific shop service."""

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    ]

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    shop = models.ForeignKey(
        Shop,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    service = models.ForeignKey(
        ShopService,
        on_delete=models.PROTECT,
        related_name='bookings'
    )

    scheduled_date = models.DateField()
    scheduled_time = models.TimeField()
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending'
    )

    customer_notes = models.TextField(blank=True, null=True)
    shop_notes = models.TextField(blank=True, null=True)
    total_price = models.DecimalField(
        max_digits=10, decimal_places=2,
        help_text="Snapshot of service price at booking time"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_date', '-scheduled_time']

    def __str__(self):
        return (
            f"Booking #{self.id} — {self.customer.username} "
            f"@ {self.shop.name} on {self.scheduled_date}"
        )

    def save(self, *args, **kwargs):
        # Snapshot the service price on first creation
        if not self.pk and not self.total_price:
            self.total_price = self.service.price
        super().save(*args, **kwargs)