package com.learning.lms.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserSummaryDto {
    private Long id;
    private String username;
    private String firstname;
    private String lastname;
    private String avatarUrl;
    private Integer level;
}