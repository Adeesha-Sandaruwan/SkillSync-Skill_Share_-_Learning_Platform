package com.learning.lms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class LearningPlanSummaryDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private boolean isPublic;
    private LocalDate targetDate;
    private List<String> tags;
    private LocalDateTime createdAt;
    private UserSummaryDto user;
    private int totalSteps; // Just the count, not the list!
}