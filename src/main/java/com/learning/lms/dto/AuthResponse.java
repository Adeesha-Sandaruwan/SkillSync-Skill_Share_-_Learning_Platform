package com.learning.lms.dto;

import com.learning.lms.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private User user;
    private String token;
}
