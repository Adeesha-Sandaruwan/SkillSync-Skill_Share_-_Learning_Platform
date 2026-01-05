package com.learning.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProgressUpdateRequest {
    @NotBlank
    private String updateText;

    private String status; // e.g., "In Progress", "Completed"
}