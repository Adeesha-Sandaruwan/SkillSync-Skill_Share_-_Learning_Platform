package com.learning.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDto {
    private Long id;
    private String username;
    private String firstname;
    private String lastname;
    private String avatarUrl;
    private Integer level;
    private String reactionType; // Optional: To show which reaction they used
}