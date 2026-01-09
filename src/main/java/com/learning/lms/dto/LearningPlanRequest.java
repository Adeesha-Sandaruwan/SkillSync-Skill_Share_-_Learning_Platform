package com.learning.lms.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class LearningPlanRequest {
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private LocalDate targetDate;
    private List<PlanStepRequest> steps;
}