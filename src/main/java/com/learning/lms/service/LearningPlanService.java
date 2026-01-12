package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.dto.PlanStepRequest;
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.entity.PlanStep;
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.PlanStepRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository planRepository;
    private final UserRepository userRepository;
    private final PlanStepRepository stepRepository;

    public List<LearningPlan> getUserPlans(Long userId) {
        return planRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public LearningPlan createPlan(Long userId, LearningPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return savePlanFromRequest(user, request);
    }

    @Transactional
    public List<LearningPlan> createBulkPlans(Long userId, List<LearningPlanRequest> requests) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<LearningPlan> plans = new ArrayList<>();

        // Loop through requests and save each one using the helper method
        for (LearningPlanRequest req : requests) {
            plans.add(savePlanFromRequest(user, req));
        }
        return plans;
    }

    // --- HELPER METHOD: Handles mapping safely for both Single and Bulk ---
    private LearningPlan savePlanFromRequest(User user, LearningPlanRequest request) {
        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());
        plan.setTargetDate(request.getTargetDate());
        plan.setPublic(true);
        plan.setUser(user);

        // Handle Tags (Safely)
        if (request.getTags() != null) {
            plan.setTags(request.getTags());
        }

        // Handle Steps (Safely)
        if (request.getSteps() != null) {
            // Ensure the list is initialized
            if (plan.getSteps() == null) {
                plan.setSteps(new ArrayList<>());
            }

            for (PlanStepRequest stepReq : request.getSteps()) {
                PlanStep step = new PlanStep();
                step.setTitle(stepReq.getTitle());
                step.setResourceLink(stepReq.getResourceLink());
                step.setEstimatedTime(stepReq.getEstimatedTime());
                step.setCompleted(false);
                step.setLearningPlan(plan);
                plan.getSteps().add(step);
            }
        }

        return planRepository.save(plan);
    }

    public LearningPlan getPlanById(Long planId) {
        return planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
    }

    public List<LearningPlan> getPublicPlans(String query, String difficulty, String category) {
        if ((query == null || query.isBlank()) &&
                (difficulty == null || difficulty.equals("All")) &&
                (category == null || category.equals("All"))) {
            return planRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        }

        if (difficulty == null || difficulty.isBlank()) difficulty = "All";
        if (category == null || category.isBlank()) category = "All";
        if (query != null && query.isBlank()) query = null;

        return planRepository.searchPlans(query, difficulty, category);
    }

    public List<LearningPlan> getPublicPlans() {
        return planRepository.findByIsPublicTrueOrderByCreatedAtDesc();
    }

    @Transactional
    public LearningPlan updatePlan(Long planId, LearningPlanRequest request) {
        LearningPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setTargetDate(request.getTargetDate());

        // Note: You can add tag/step update logic here if needed later

        return planRepository.save(plan);
    }

    @Transactional
    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
    }

    @Transactional
    public void toggleStep(Long stepId) {
        PlanStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        step.setCompleted(!step.isCompleted());
        stepRepository.save(step);
    }

    @Transactional
    public LearningPlan clonePlan(Long originalPlanId, Long newOwnerId) {
        LearningPlan original = planRepository.findById(originalPlanId)
                .orElseThrow(() -> new RuntimeException("Original plan not found"));

        User newOwner = userRepository.findById(newOwnerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan clone = new LearningPlan();
        clone.setTitle(original.getTitle() + " (Copy)");
        clone.setDescription(original.getDescription());
        clone.setCategory(original.getCategory());
        clone.setDifficulty(original.getDifficulty());
        clone.setTargetDate(original.getTargetDate());
        clone.setPublic(true);
        clone.setClonedFromId(original.getId());
        clone.setUser(newOwner);

        // Copy tags
        if (original.getTags() != null) {
            clone.setTags(new ArrayList<>(original.getTags()));
        }

        for (PlanStep oldStep : original.getSteps()) {
            PlanStep newStep = new PlanStep();
            newStep.setTitle(oldStep.getTitle());
            newStep.setResourceLink(oldStep.getResourceLink());
            newStep.setEstimatedTime(oldStep.getEstimatedTime());
            newStep.setCompleted(false);
            newStep.setLearningPlan(clone);
            clone.getSteps().add(newStep);
        }

        return planRepository.save(clone);
    }
}