from django.urls import path
from .views import RepairTimelineView

urlpatterns = [
    path('<int:request_id>/', RepairTimelineView.as_view(), name='repair-timeline'),
]