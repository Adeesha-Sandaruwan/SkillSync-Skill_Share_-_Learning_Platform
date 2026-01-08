package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Data
@Table(name = "plan_steps")
public class PlanStep {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String resourceLink;
    private String estimatedTime;
    private boolean isCompleted = false;

    // --- THE FIX: Pointing back to Parent ---
    // @JsonBackReference tells Jackson: "Stop here, don't serialize the parent again"
    @ManyToOne
    @JoinColumn(name = "learning_plan_id")
    @JsonBackReference
    @ToString.Exclude
    private LearningPlan learningPlan;
}