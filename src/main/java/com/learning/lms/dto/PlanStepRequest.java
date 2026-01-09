package com.learning.lms.dto;

import lombok.Data;

@Data
public class PlanStepRequest {
    private String title;
    private String resourceLink;
    private String estimatedTime;
}