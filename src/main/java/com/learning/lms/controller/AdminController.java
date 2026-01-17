package com.learning.lms.controller;

import com.learning.lms.entity.ChatMessage;
import com.learning.lms.entity.Role;
import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import com.learning.lms.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final SkillPostRepository postRepository;
    private final LearningPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;
    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    // --- 1. OVERVIEW STATS ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalPosts", postRepository.count(),
                "totalPlans", planRepository.count(),
                "activeNow", 5 // Mock or implement real session tracking
        ));
    }

    // --- 2. USER MANAGEMENT ---
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll(Sort.by(Sort.Direction.DESC, "id")));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.ok("User deleted");
    }

    // Contact User via Chat System
    @PostMapping("/users/{id}/contact")
    public ResponseEntity<?> contactUser(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        User admin = userRepository.findByUsername("admin").orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setSenderId(admin.getId());
        message.setRecipientId(id);
        message.setContent("⚠️ ADMIN ALERT: " + payload.get("message"));
        message.setType(ChatMessage.MessageType.TEXT);
        message.setTimestamp(LocalDateTime.now());
        message.setStatus(ChatMessage.MessageStatus.DELIVERED);

        ChatMessage saved = chatService.save(message);

        // Push to WebSocket so user sees it instantly
        messagingTemplate.convertAndSendToUser(String.valueOf(id), "/queue/messages", saved);

        return ResponseEntity.ok("Message sent");
    }

    // --- 3. POST MANAGEMENT ---
    @GetMapping("/posts")
    public ResponseEntity<List<SkillPost>> getAllPosts() {
        return ResponseEntity.ok(postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @DeleteMapping("/posts/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        postRepository.deleteById(id);
        return ResponseEntity.ok("Post deleted");
    }

    // --- 4. SYSTEM LOGS ---
    @GetMapping("/logs")
    public ResponseEntity<List<Map<String, Object>>> getSystemLogs() {
        List<User> recentUsers = userRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
        List<SkillPost> recentPosts = postRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        // Create a mutable list explicitly typed
        List<Map<String, Object>> logs = new ArrayList<>();

        // Add Recent Users
        logs.addAll(recentUsers.stream().limit(5)
                .map(u -> Map.<String, Object>of( // <--- FIX: Explicit type casting
                        "type", "USER_REGISTER",
                        "message", "New user registered: " + u.getUsername(),
                        "time", u.getId()
                )).collect(Collectors.toList()));

        // Add Recent Posts
        logs.addAll(recentPosts.stream().limit(5)
                .map(p -> Map.<String, Object>of( // <--- FIX: Explicit type casting
                        "type", "NEW_POST",
                        "message", "Post created by user ID " + p.getUser().getId(),
                        "time", p.getCreatedAt().toString()
                )).collect(Collectors.toList()));

        return ResponseEntity.ok(logs);
    }

    // --- 5. ADMIN MANAGEMENT ---
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody User request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username exists");
        }
        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .xp(0)
                .level(100)
                .build();
        userRepository.save(user);
        return ResponseEntity.ok("Admin created");
    }
}