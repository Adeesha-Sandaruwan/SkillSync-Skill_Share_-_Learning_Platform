package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.dto.PlanStepRequest; // Assuming you have/need this DTO
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.entity.PlanStep;
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.PlanStepRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());
        plan.setTargetDate(request.getTargetDate());
        plan.setPublic(true); // Default
        plan.setUser(user);

        // Add Steps if provided in request
        if (request.getSteps() != null) {
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

    @Transactional
    public LearningPlan updatePlan(Long planId, LearningPlanRequest request) {
        LearningPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setTargetDate(request.getTargetDate());
        // We don't overwrite steps here usually, steps are managed individually or via a specific edit endpoint
        // to avoid wiping progress.

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

    // --- INDUSTRY LEVEL FEATURE: CLONING ---
    @Transactional
    public LearningPlan clonePlan(Long originalPlanId, Long newOwnerId) {
        LearningPlan original = planRepository.findById(originalPlanId)
                .orElseThrow(() -> new RuntimeException("Original plan not found"));

        User newOwner = userRepository.findById(newOwnerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create the shell
        LearningPlan clone = new LearningPlan();
        clone.setTitle(original.getTitle() + " (Copy)");
        clone.setDescription(original.getDescription());
        clone.setCategory(original.getCategory());
        clone.setDifficulty(original.getDifficulty());
        clone.setTargetDate(original.getTargetDate()); // Can be adjusted by user later
        clone.setPublic(true);
        clone.setClonedFromId(original.getId());
        clone.setUser(newOwner);

        // Deep Copy Steps (Resetting progress)
        for (PlanStep oldStep : original.getSteps()) {
            PlanStep newStep = new PlanStep();
            newStep.setTitle(oldStep.getTitle());
            newStep.setResourceLink(oldStep.getResourceLink());
            newStep.setEstimatedTime(oldStep.getEstimatedTime());
            newStep.setCompleted(false); // Reset progress!
            newStep.setLearningPlan(clone);
            clone.getSteps().add(newStep);
        }

        return planRepository.save(clone);
    }
}