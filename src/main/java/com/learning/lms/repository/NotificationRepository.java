package com.learning.lms.repository;

import com.learning.lms.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Get unread notifications first, then sorted by date
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);

    // Count unread notifications (for the badge number)
    long countByRecipientIdAndIsReadFalse(Long recipientId);
}