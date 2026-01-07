package com.learning.lms.controller;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.service.LearningPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LearningPlanController {

    private final LearningPlanService planService;

    // POST /api/users/{userId}/plans (Create Plan)
    @PostMapping("/users/{userId}/plans")
    public ResponseEntity<LearningPlan> createPlan(@PathVariable Long userId, @Valid @RequestBody LearningPlanRequest request) {
        return ResponseEntity.ok(planService.createPlan(userId, request));
    }

    // GET /api/users/{userId}/plans (Get User Plans)
    @GetMapping("/users/{userId}/plans")
    public ResponseEntity<List<LearningPlan>> getUserPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(planService.getUserPlans(userId));
    }

    // PUT /api/plans/{planId} (Update Plan)
    @PutMapping("/plans/{planId}")
    public ResponseEntity<LearningPlan> updatePlan(@PathVariable Long planId, @Valid @RequestBody LearningPlanRequest request) {
        return ResponseEntity.ok(planService.updatePlan(planId, request));
    }

    // DELETE /api/plans/{planId} (Delete Plan)
    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        planService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }
}