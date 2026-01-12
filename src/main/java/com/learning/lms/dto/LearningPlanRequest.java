package com.learning.lms.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class LearningPlanRequest {
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private LocalDate targetDate;

    // --- NEW: Added Tags ---
    private List<String> tags = new ArrayList<>();

    private List<PlanStepRequest> steps;
}