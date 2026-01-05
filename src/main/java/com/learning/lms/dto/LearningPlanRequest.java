package com.learning.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class LearningPlanRequest {

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String topic;

    private String resources;

    private LocalDate startDate;

    private LocalDate targetDate;
}