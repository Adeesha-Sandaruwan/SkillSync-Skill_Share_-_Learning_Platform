package com.learning.lms.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.learning.lms.config.JwtService;
import com.learning.lms.dto.AuthenticationResponse;
import com.learning.lms.entity.User;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService; // Ensure you have this from your existing auth logic
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Transactional
    public AuthenticationResponse authenticateGoogleUser(String idTokenString) {
        try {
            // 1. Verify Token with Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(clientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) throw new RuntimeException("Invalid Google Token");

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            // 2. Check if user exists, if not -> Register
            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                // Generate a unique username based on email or random UUID
                String baseName = email.split("@")[0];
                String uniqueUsername = baseName + "_" + UUID.randomUUID().toString().substring(0, 4);

                newUser.setUsername(uniqueUsername);
                newUser.setFirstname(name);
                newUser.setAvatarUrl(pictureUrl);
                newUser.setLevel(1);
                newUser.setXp(0);
                newUser.getBadges().add("NOVICE");

                // Set a random strong password (user won't use it, they use Google)
                newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));

                return userRepository.save(newUser);
            });

            // 3. Generate JWT
            String jwtToken = jwtService.generateToken(user);
            return AuthenticationResponse.builder()
                    .token(jwtToken)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .build();

        } catch (Exception e) {
            throw new RuntimeException("Google Authentication Failed: " + e.getMessage());
        }
    }
}