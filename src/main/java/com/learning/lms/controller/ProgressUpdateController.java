package com.learning.lms.controller;

import com.learning.lms.dto.ProgressUpdateRequest;
import com.learning.lms.entity.ProgressUpdate;
import com.learning.lms.service.ProgressUpdateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProgressUpdateController {

    private final ProgressUpdateService updateService;

    // POST /api/users/{userId}/updates (Add Update)
    @PostMapping("/users/{userId}/updates")
    public ResponseEntity<ProgressUpdate> addUpdate(@PathVariable Long userId, @Valid @RequestBody ProgressUpdateRequest request) {
        return ResponseEntity.ok(updateService.addUpdate(userId, request));
    }

    // GET /api/users/{userId}/updates (Get User's Journey)
    @GetMapping("/users/{userId}/updates")
    public ResponseEntity<List<ProgressUpdate>> getUserUpdates(@PathVariable Long userId) {
        return ResponseEntity.ok(updateService.getUserUpdates(userId));
    }

    // DELETE /api/updates/{updateId} (Delete Update)
    @DeleteMapping("/updates/{updateId}")
    public ResponseEntity<Void> deleteUpdate(@PathVariable Long updateId) {
        updateService.deleteUpdate(updateId);
        return ResponseEntity.noContent().build();
    }
}