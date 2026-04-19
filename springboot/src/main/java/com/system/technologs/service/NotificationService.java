package com.system.technologs.service;

import com.system.technologs.model.Notification;
import com.system.technologs.model.User;
import com.system.technologs.repository.NotificationRepository;
import com.system.technologs.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    // ── Send Notification Async ──
    // Called by Django when repair status changes
    @Async
    public CompletableFuture<Notification> sendNotification(
            Long userId, String message) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException(
                    "User not found with id: " + userId));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        return CompletableFuture.completedFuture(saved);
    }

    // ── Notify Customer on Repair Submit Async ──
    @Async
    public CompletableFuture<Void> notifyRepairSubmitted(
            Long customerId) {

        sendNotification(
            customerId,
            "Your repair request has been received. We will update you shortly."
        );
        return CompletableFuture.completedFuture(null);
    }

    // ── Notify Technician on Repair Assigned Async ──
    @Async
    public CompletableFuture<Void> notifyTechnicianAssigned(
            Long technicianId, String deviceBrand, String deviceModel) {

        sendNotification(
            technicianId,
            "A new repair request has been assigned to you: "
                + deviceBrand + " " + deviceModel
        );
        return CompletableFuture.completedFuture(null);
    }

    // ── Notify Customer on Status Update Async ──
    @Async
    public CompletableFuture<Void> notifyRepairStatusUpdated(
            Long customerId, String status) {

        sendNotification(
            customerId,
            "Your repair status has been updated to: " + status
        );
        return CompletableFuture.completedFuture(null);
    }

    // ── Notify Customer on Repair Completed Async ──
    @Async
    public CompletableFuture<Void> notifyRepairCompleted(
            Long customerId, String deviceBrand, String deviceModel) {

        sendNotification(
            customerId,
            "Your repair for " + deviceBrand + " "
                + deviceModel + " has been completed!"
        );
        return CompletableFuture.completedFuture(null);
    }

    // ── Get All Notifications for User ──
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository
                .findByUserUserIdOrderByCreatedAtDesc(userId);
    }

    // ── Get Unread Notifications for User ──
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository
                .findByUserUserIdAndIsRead(userId, false);
    }

    // ── Count Unread Notifications ──
    public long countUnreadNotifications(Long userId) {
        return notificationRepository
                .countByUserUserIdAndIsRead(userId, false);
    }

    // ── Mark Notification as Read ──
    public Notification markAsRead(Long notificationId) {
        Notification notification = notificationRepository
                .findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException(
                    "Notification not found with id: " + notificationId));

        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }

    // ── Mark All Notifications as Read ──
    public void markAllAsRead(Long userId) {
        List<Notification> unread = getUnreadNotifications(userId);
        unread.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unread);
    }
}