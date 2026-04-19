package com.system.technologs.repository;

import com.system.technologs.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get all notifications for a user
    List<Notification> findByUserUserId(Long userId);

    // Get unread notifications for a user
    List<Notification> findByUserUserIdAndIsRead(Long userId, Boolean isRead);

    // Count unread notifications for a user
    long countByUserUserIdAndIsRead(Long userId, Boolean isRead);

    // Get all notifications for a user ordered by date
    List<Notification> findByUserUserIdOrderByCreatedAtDesc(Long userId);
}