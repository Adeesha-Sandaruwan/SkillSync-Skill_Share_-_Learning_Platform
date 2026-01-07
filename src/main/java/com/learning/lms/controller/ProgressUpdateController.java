package com.learning.lms.controller;

import com.learning.lms.entity.ProgressUpdate;
import com.learning.lms.entity.User;
import com.learning.lms.enums.ProgressType;
import com.learning.lms.repository.ProgressUpdateRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressUpdateController {

    // We use Repositories directly here to handle the Enum types easily
    private final ProgressUpdateRepository progressRepository;
    private final UserRepository userRepository;

    @PostMapping("/users/{userId}/progress")
    public ResponseEntity<ProgressUpdate> createUpdate(
            @PathVariable Long userId,
            @RequestBody ProgressRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProgressUpdate update = ProgressUpdate.builder()
                .content(request.content())
                // Use the type from frontend, or default to LEARNING (Blue)
                .type(request.type() != null ? request.type() : ProgressType.LEARNING)
                .user(user)
                .build();

        return ResponseEntity.ok(progressRepository.save(update));
    }

    @GetMapping("/users/{userId}/progress")
    public ResponseEntity<List<ProgressUpdate>> getUserUpdates(@PathVariable Long userId) {
        return ResponseEntity.ok(progressRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @DeleteMapping("/progress/{id}")
    public ResponseEntity<Void> deleteUpdate(@PathVariable Long id) {
        progressRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Helper Record to capture the JSON data including the 'type'
    public record ProgressRequest(String content, ProgressType type) {}
}