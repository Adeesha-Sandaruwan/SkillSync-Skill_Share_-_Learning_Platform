package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import org.hibernate.annotations.BatchSize;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "learning_plans")
public class LearningPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    // ✅ FORCE TEXT TYPE: Ensures DB knows this is text, not binary
    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private String difficulty;

    @Column(nullable = false)
    private boolean isPublic = true;

    private Long clonedFromId;

    // --- OPTIMIZED: Batch Fetching for Tags ---
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "plan_tags", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "tag")
    @BatchSize(size = 20)
    private List<String> tags = new ArrayList<>();

    private String topic;

    @Column(columnDefinition = "TEXT") // Added TEXT here too just in case resources get long
    private String resources;

    private LocalDate startDate;
    private LocalDate targetDate;

    // --- OPTIMIZED: Lazy + Batch Fetching for Steps ---
    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference
    @ToString.Exclude
    @BatchSize(size = 20)
    private List<PlanStep> steps = new ArrayList<>();

    // --- OPTIMIZED: Lazy Loading for User ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "posts", "plans", "progressUpdates", "comments", "following", "followers", "hibernateLazyInitializer", "handler"})
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}