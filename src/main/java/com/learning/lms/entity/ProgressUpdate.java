package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.learning.lms.enums.ProgressType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "progress_updates")
public class ProgressUpdate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    // NEW FIELD: Stores if it is a Milestone, Blocker, etc.
    @Enumerated(EnumType.STRING)
    private ProgressType type = ProgressType.LEARNING;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "posts", "plans", "progressUpdates", "followers", "following", "notifications"})
    private User user;
}