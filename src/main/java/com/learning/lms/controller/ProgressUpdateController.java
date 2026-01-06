package com.learning.lms.controller;

import com.learning.lms.entity.ProgressUpdate;
import com.learning.lms.service.ProgressUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressUpdateController {

    private final ProgressUpdateService progressService;

    @PostMapping("/users/{userId}/progress")
    public ResponseEntity<ProgressUpdate> createUpdate(@PathVariable Long userId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(progressService.createUpdate(userId, payload.get("content")));
    }

    @GetMapping("/users/{userId}/progress")
    public ResponseEntity<List<ProgressUpdate>> getUserUpdates(@PathVariable Long userId) {
        return ResponseEntity.ok(progressService.getUserUpdates(userId));
    }

    @DeleteMapping("/progress/{id}")
    public ResponseEntity<Void> deleteUpdate(@PathVariable Long id) {
        progressService.deleteUpdate(id);
        return ResponseEntity.noContent().build();
    }
}