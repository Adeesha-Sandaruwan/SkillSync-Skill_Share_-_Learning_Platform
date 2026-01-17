package com.learning.lms.controller;

import com.learning.lms.entity.Role;
import com.learning.lms.entity.SkillPost; // Corrected Entity Import
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository; // Ensure this matches your file name
import com.learning.lms.repository.SkillPostRepository;    // Corrected Repo Import
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final SkillPostRepository skillPostRepository; // Corrected Variable
    private final LearningPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
                "users", userRepository.count(),
                "posts", skillPostRepository.count(), // Uses correct repo
                "plans", planRepository.count()
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok("User deleted");
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody User request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .xp(0)
                .level(1)
                .build();
        userRepository.save(user);
        return ResponseEntity.ok("Admin created successfully");
    }

    // --- POST MANAGEMENT (Updated to SkillPost) ---
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        if (skillPostRepository.existsById(id)) {
            skillPostRepository.deleteById(id);
            return ResponseEntity.ok("Post deleted");
        }
        return ResponseEntity.notFound().build();
    }

    // --- PLAN MANAGEMENT ---
    @DeleteMapping("/plans/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable Long id) {
        if (planRepository.existsById(id)) {
            planRepository.deleteById(id);
            return ResponseEntity.ok("Plan deleted");
        }
        return ResponseEntity.notFound().build();
    }
}