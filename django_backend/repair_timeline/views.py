"""
repair_timeline/views.py

Stores and retrieves the status-change history for each repair request.
Each time a repair moves to a new status (pending → accepted → in_progress …),
one event document is appended to the MongoDB "repair_timeline" collection.

Endpoints:
  GET  /api/timeline/<request_id>/   — fetch full history for a repair
  POST /api/timeline/<request_id>/   — append a new event

MongoDB document shape:
{
  _id        : ObjectId,
  request_id : int,          -- matches repair_requests.id (PostgreSQL)
  status     : str,          -- new status after this event
  changed_by : int,          -- user.id who made the change
  changed_by_username : str, -- denormalised for display
  note       : str | None,   -- optional technician/admin note
  created_at : datetime (UTC)
}
"""

from datetime import datetime, timezone
from bson import ObjectId
from bson.errors import InvalidId

from django.http import JsonResponse
from django.views import View
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

from repair.models import RepairRequest
from .mongo import get_timeline_collection

import json


def _doc_to_dict(doc: dict) -> dict:
    """Convert a MongoDB document to a JSON-serialisable dict."""
    return {
        'event_id'            : str(doc['_id']),
        'request_id'          : doc.get('request_id'),
        'status'              : doc.get('status'),
        'changed_by'          : doc.get('changed_by'),
        'changed_by_username' : doc.get('changed_by_username'),
        'note'                : doc.get('note'),
        'created_at'          : doc['created_at'].isoformat()
                                if isinstance(doc.get('created_at'), datetime)
                                else str(doc.get('created_at')),
    }


@method_decorator(csrf_exempt, name='dispatch')
class RepairTimelineView(View):
    """
    GET  /api/timeline/<request_id>/  — full event history, newest first
    POST /api/timeline/<request_id>/  — append a status-change event
    """

    def _get_repair_or_403(self, request, request_id: int):
        """
        Return the RepairRequest if the current user is allowed to see it.
        Raises PermissionError on access denial, RepairRequest.DoesNotExist if not found.
        """
        repair = RepairRequest.objects.select_related('customer', 'assigned_technician', 'shop').get(pk=request_id)
        user   = request.user

        if user.is_staff:
            return repair  # admins see everything

        # Owners see repairs in their shop
        if hasattr(user, 'owned_shops') and user.owned_shops.filter(pk=repair.shop_id).exists():
            return repair

        if repair.customer == user or repair.assigned_technician == user:
            return repair

        raise PermissionError

    # ── GET ────────────────────────────────────────────────────────────────
    def get(self, request, request_id: int):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'message': 'Unauthorized.'}, status=401)

        try:
            self._get_repair_or_403(request, request_id)
        except RepairRequest.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Repair not found.'}, status=404)
        except PermissionError:
            return JsonResponse({'success': False, 'message': 'Forbidden.'}, status=403)

        col    = get_timeline_collection()
        cursor = col.find({'request_id': request_id}, sort=[('created_at', -1)])
        events = [_doc_to_dict(doc) for doc in cursor]

        return JsonResponse({'success': True, 'events': events})

    # ── POST ───────────────────────────────────────────────────────────────
    def post(self, request, request_id: int):
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'message': 'Unauthorized.'}, status=401)

        try:
            repair = self._get_repair_or_403(request, request_id)
        except RepairRequest.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Repair not found.'}, status=404)
        except PermissionError:
            return JsonResponse({'success': False, 'message': 'Forbidden.'}, status=403)

        try:
            body = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Invalid JSON.'}, status=400)

        status = body.get('status', '').strip()
        note   = body.get('note', '').strip() or None

        valid_statuses = [s for s, _ in RepairRequest.STATUS_CHOICES]
        if status not in valid_statuses:
            return JsonResponse({
                'success': False,
                'message': f'Invalid status. Choose from: {", ".join(valid_statuses)}',
            }, status=400)

        # Update the repair status in PostgreSQL
        repair.status = status
        repair.save(update_fields=['status', 'updated_at'])

        # Append event to MongoDB
        col    = get_timeline_collection()
        result = col.insert_one({
            'request_id'          : request_id,
            'status'              : status,
            'changed_by'          : request.user.pk,
            'changed_by_username' : request.user.username,
            'note'                : note,
            'created_at'          : datetime.now(timezone.utc),
        })

        return JsonResponse({
            'success'  : True,
            'event_id' : str(result.inserted_id),
            'message'  : f'Status updated to "{status}".',
        }, status=201)