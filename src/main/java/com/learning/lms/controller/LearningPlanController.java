package com.learning.lms.controller;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.dto.LearningPlanSummaryDto;
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

    @PostMapping("/users/{userId}/plans")
    public ResponseEntity<LearningPlan> createPlan(@PathVariable Long userId, @Valid @RequestBody LearningPlanRequest request) {
        return ResponseEntity.ok(planService.createPlan(userId, request));
    }

    @PostMapping("/users/{userId}/plans/bulk")
    public ResponseEntity<List<LearningPlan>> createBulkPlans(@PathVariable Long userId, @RequestBody List<LearningPlanRequest> requests) {
        return ResponseEntity.ok(planService.createBulkPlans(userId, requests));
    }

    @GetMapping("/users/{userId}/plans")
    public ResponseEntity<List<LearningPlanSummaryDto>> getUserPlans(@PathVariable Long userId) {
        return ResponseEntity.ok(planService.getUserPlans(userId));
    }

    @GetMapping("/plans/{planId}")
    public ResponseEntity<LearningPlan> getPlanById(@PathVariable Long planId) {
        return ResponseEntity.ok(planService.getPlanById(planId));
    }

    @PutMapping("/plans/{planId}")
    public ResponseEntity<LearningPlan> updatePlan(@PathVariable Long planId, @Valid @RequestBody LearningPlanRequest request) {
        return ResponseEntity.ok(planService.updatePlan(planId, request));
    }

    @DeleteMapping("/plans/{planId}")
    public ResponseEntity<Void> deletePlan(@PathVariable Long planId) {
        planService.deletePlan(planId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/plans/steps/{stepId}/toggle")
    public ResponseEntity<Void> toggleStep(@PathVariable Long stepId) {
        planService.toggleStep(stepId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/plans/public")
    public ResponseEntity<List<LearningPlanSummaryDto>> getPublicPlans(
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "All") String difficulty,
            @RequestParam(defaultValue = "All") String category
    ) {
        return ResponseEntity.ok(planService.getPublicPlans(q, difficulty, category));
    }

    @PostMapping("/plans/{planId}/clone")
    public ResponseEntity<LearningPlan> clonePlan(@PathVariable Long planId, @RequestParam Long userId) {
        return ResponseEntity.ok(planService.clonePlan(planId, userId));
    }
}