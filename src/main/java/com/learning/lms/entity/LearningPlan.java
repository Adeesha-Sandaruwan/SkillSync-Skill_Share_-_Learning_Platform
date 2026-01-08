package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference; // Import this
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString; // Import to prevent Lombok infinite loops in toString

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList; // Import ArrayList
import java.util.List;

@Entity
@Data
@Table(name = "learning_plans")
public class LearningPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String category;
    private String difficulty; // Beginner, Intermediate, Advanced

    // These fields were in your snippet, keeping them if you use them
    private String topic;
    private String resources;
    private LocalDate startDate;
    private LocalDate targetDate;

    // --- THE FIX: Relationship to Steps ---
    // @JsonManagedReference tells Jackson: "Serialize this list"
    // orphanRemoval = true means if you remove a step from this list, delete it from DB
    @OneToMany(mappedBy = "learningPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JsonManagedReference
    @ToString.Exclude // Prevent Lombok infinite loop
    private List<PlanStep> steps = new ArrayList<>();

    // --- User Relationship ---
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "posts", "plans", "progressUpdates", "comments", "following", "followers"})
    private User user;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}