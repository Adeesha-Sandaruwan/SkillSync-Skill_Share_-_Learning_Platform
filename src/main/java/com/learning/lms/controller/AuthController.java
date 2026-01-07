package com.learning.lms.controller;

import com.learning.lms.config.JwtService;
import com.learning.lms.dto.AuthResponse;
import com.learning.lms.dto.LoginRequest;
import com.learning.lms.dto.RegisterRequest;
import com.learning.lms.entity.User;
import com.learning.lms.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<User> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.registerUser(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            User user = userService.loginUser(request);
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(user, token));
        } catch (RuntimeException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<AuthResponse>build();
        }
    }
}