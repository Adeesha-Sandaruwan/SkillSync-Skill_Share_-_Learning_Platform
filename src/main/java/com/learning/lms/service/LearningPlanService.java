package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.dto.LearningPlanSummaryDto;
import com.learning.lms.dto.UserSummaryDto;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository planRepository;
    private final UserRepository userRepository;
    private final PlanStepRepository stepRepository;

    public List<LearningPlanSummaryDto> getUserPlans(Long userId) {
        List<LearningPlan> plans = planRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return plans.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
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
        for (LearningPlanRequest req : requests) {
            plans.add(savePlanFromRequest(user, req));
        }
        return plans;
    }

    private LearningPlan savePlanFromRequest(User user, LearningPlanRequest request) {
        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());
        plan.setTargetDate(request.getTargetDate());
        plan.setPublic(true);
        plan.setUser(user);

        if (request.getTags() != null) {
            plan.setTags(request.getTags());
        }

        if (request.getSteps() != null) {
            if (plan.getSteps() == null) plan.setSteps(new ArrayList<>());
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

    public List<LearningPlanSummaryDto> getPublicPlans(String query, String difficulty, String category) {
        List<LearningPlan> plans;
        if ((query == null || query.isBlank()) &&
                (difficulty == null || difficulty.equals("All")) &&
                (category == null || category.equals("All"))) {
            plans = planRepository.findByIsPublicTrueOrderByCreatedAtDesc();
        } else {
            if (difficulty == null || difficulty.isBlank()) difficulty = "All";
            if (category == null || category.isBlank()) category = "All";
            if (query != null && query.isBlank()) query = null;
            plans = planRepository.searchPlans(query, difficulty, category);
        }
        return plans.stream().map(this::mapToSummaryDto).collect(Collectors.toList());
    }

    @Transactional
    public LearningPlan updatePlan(Long planId, LearningPlanRequest request) {
        LearningPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setTargetDate(request.getTargetDate());
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

    // --- MAPPER HELPERS ---
    private LearningPlanSummaryDto mapToSummaryDto(LearningPlan plan) {
        return LearningPlanSummaryDto.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .description(plan.getDescription())
                .category(plan.getCategory())
                .difficulty(plan.getDifficulty())
                .isPublic(plan.isPublic())
                .targetDate(plan.getTargetDate())
                .tags(plan.getTags())
                .createdAt(plan.getCreatedAt())
                .totalSteps(plan.getSteps() != null ? plan.getSteps().size() : 0)
                .user(mapToUserDto(plan.getUser()))
                .build();
    }

    private UserSummaryDto mapToUserDto(User user) {
        if (user == null) return null;
        return UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .avatarUrl(user.getAvatarUrl())
                .level(user.getLevel())
                .build();
    }
}