package com.learning.lms.controller;// ... imports
import com.learning.lms.dto.AuthenticationResponse;
import com.learning.lms.service.AuthService;
import com.learning.lms.service.GoogleAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private final AuthService service; // Your existing service
    private final GoogleAuthService googleService; // NEW

    // ... existing register/login endpoints ...

    @PostMapping("/google")
    public ResponseEntity<AuthenticationResponse> googleLogin(@RequestBody Map<String, String> payload) {
        String token = payload.get("token");
        return ResponseEntity.ok(googleService.authenticateGoogleUser(token));
    }
}