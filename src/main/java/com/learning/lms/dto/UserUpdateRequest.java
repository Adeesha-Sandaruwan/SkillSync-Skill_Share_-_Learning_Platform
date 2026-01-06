package com.learning.lms.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String username;
    private String bio;
    private String avatarUrl;
}