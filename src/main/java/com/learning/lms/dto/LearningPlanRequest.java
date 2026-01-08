package com.learning.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class LearningPlanRequest {

    @NotBlank
    private String title;

    private String description;

    // These match your frontend dropdowns
    private String category;
    private String difficulty;

    // Optional fields
    private String topic;
    private String resources;
    private LocalDate startDate;
    private LocalDate targetDate;

    // This matches the DTO structure you requested
    private List<StepRequest> steps;

    @Data
    public static class StepRequest {
        private String title;
        private String resourceLink;
        private String estimatedTime;
    }
}