package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.learning.lms.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // FIX: Changed to EAGER so the Frontend gets the User data immediately
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipient_id", nullable = false)
    @JsonIgnoreProperties({"notifications", "posts", "followers", "following", "password", "authorities"})
    private User recipient;

    // FIX: Changed to EAGER
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "actor_id", nullable = false)
    @JsonIgnoreProperties({"notifications", "posts", "followers", "following", "password", "authorities"})
    private User actor;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String message;

    private Long relatedPostId;

    private boolean isRead = false;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}