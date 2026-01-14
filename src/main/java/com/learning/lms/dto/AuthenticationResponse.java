package com.learning.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthenticationResponse {
    private String token;
    private Long id; // <--- CHANGED from 'userId' to 'id' to match Frontend expectations
    private String username;
    private String role;
}