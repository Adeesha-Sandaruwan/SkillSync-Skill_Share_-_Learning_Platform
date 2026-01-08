package com.learning.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserStatsResponse {
    private int totalPosts;
    private int totalLikes;
    private int totalPlans;
    private int totalStepsCompleted; // New Field
    private int followers;
    private int following;
}