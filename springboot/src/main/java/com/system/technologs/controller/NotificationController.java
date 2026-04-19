package com.system.technologs.controller;

import com.system.technologs.model.Notification;
import com.system.technologs.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    // ── POST /api/notifications/send ──
    // Called by Django when repair status changes
    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendNotification(
            @RequestBody Map<String, Object> body) {

        Long userId = Long.valueOf(body.get("user_id").toString());
        String message = body.get("message").toString();

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Message is required."
            ));
        }

        notificationService.sendNotification(userId, message);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notification sent successfully."
        ));
    }

    // ── POST /api/notifications/repair-submitted ──
    // Called by Django when customer submits repair request
    @PostMapping("/repair-submitted")
    public ResponseEntity<Map<String, Object>> notifyRepairSubmitted(
            @RequestBody Map<String, Object> body) {

        Long customerId = Long.valueOf(body.get("customer_id").toString());
        notificationService.notifyRepairSubmitted(customerId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Customer notified of repair submission."
        ));
    }

    // ── POST /api/notifications/technician-assigned ──
    // Called by Django when technician is assigned to repair
    @PostMapping("/technician-assigned")
    public ResponseEntity<Map<String, Object>> notifyTechnicianAssigned(
            @RequestBody Map<String, Object> body) {

        Long technicianId = Long.valueOf(body.get("technician_id").toString());
        String deviceBrand = body.get("device_brand").toString();
        String deviceModel = body.get("device_model").toString();

        notificationService.notifyTechnicianAssigned(
            technicianId, deviceBrand, deviceModel);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Technician notified of new assignment."
        ));
    }

    // ── POST /api/notifications/status-updated ──
    // Called by Django when repair status changes
    @PostMapping("/status-updated")
    public ResponseEntity<Map<String, Object>> notifyRepairStatusUpdated(
            @RequestBody Map<String, Object> body) {

        Long customerId = Long.valueOf(body.get("customer_id").toString());
        String status = body.get("status").toString();

        notificationService.notifyRepairStatusUpdated(customerId, status);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Customer notified of status update."
        ));
    }

    // ── POST /api/notifications/repair-completed ──
    // Called by Django when repair is completed
    @PostMapping("/repair-completed")
    public ResponseEntity<Map<String, Object>> notifyRepairCompleted(
            @RequestBody Map<String, Object> body) {

        Long customerId = Long.valueOf(body.get("customer_id").toString());
        String deviceBrand = body.get("device_brand").toString();
        String deviceModel = body.get("device_model").toString();

        notificationService.notifyRepairCompleted(
            customerId, deviceBrand, deviceModel);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Customer notified of repair completion."
        ));
    }

    // ── GET /api/notifications/{userId} ──
    // Get all notifications for a user
    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserNotifications(
            @PathVariable Long userId) {

        List<Notification> notifications =
            notificationService.getUserNotifications(userId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "notifications", notifications
        ));
    }

    // ── GET /api/notifications/{userId}/unread ──
    // Get unread notifications for a user
    @GetMapping("/{userId}/unread")
    public ResponseEntity<Map<String, Object>> getUnreadNotifications(
            @PathVariable Long userId) {

        List<Notification> notifications =
            notificationService.getUnreadNotifications(userId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "notifications", notifications
        ));
    }

    // ── GET /api/notifications/{userId}/count ──
    // Get unread notification count (for badge in React)
    @GetMapping("/{userId}/count")
    public ResponseEntity<Map<String, Object>> countUnreadNotifications(
            @PathVariable Long userId) {

        long count = notificationService.countUnreadNotifications(userId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", count
        ));
    }

    // ── PATCH /api/notifications/{id}/read ──
    // Mark single notification as read
    @PatchMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(
            @PathVariable Long id) {

        Notification notification = notificationService.markAsRead(id);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Notification marked as read.",
            "notification", notification
        ));
    }

    // ── PATCH /api/notifications/{userId}/read-all ──
    // Mark all notifications as read
    @PatchMapping("/{userId}/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @PathVariable Long userId) {

        notificationService.markAllAsRead(userId);

        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "All notifications marked as read."
        ));
    }
}