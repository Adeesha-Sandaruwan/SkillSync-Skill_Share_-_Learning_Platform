package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
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

    private final LearningPlanRepository learningPlanRepository;
    private final PlanStepRepository planStepRepository;
    private final UserRepository userRepository;

    @Transactional
    public LearningPlan createPlan(Long userId, LearningPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());
        plan.setTopic(request.getTopic());
        plan.setResources(request.getResources());
        plan.setStartDate(request.getStartDate());
        plan.setTargetDate(request.getTargetDate());
        plan.setUser(user);

        // Map Steps from Request DTO to Entity
        if (request.getSteps() != null && !request.getSteps().isEmpty()) {
            List<PlanStep> planSteps = new ArrayList<>();
            for (LearningPlanRequest.StepRequest stepReq : request.getSteps()) {
                PlanStep step = new PlanStep();
                step.setTitle(stepReq.getTitle());
                step.setResourceLink(stepReq.getResourceLink());
                step.setEstimatedTime(stepReq.getEstimatedTime());
                step.setCompleted(false);
                step.setLearningPlan(plan); // Set parent relationship
                planSteps.add(step);
            }
            plan.setSteps(planSteps);
        }

        return learningPlanRepository.save(plan);
    }

    public List<LearningPlan> getUserPlans(Long userId) {
        return learningPlanRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public LearningPlan updatePlan(Long planId, LearningPlanRequest request) {
        LearningPlan plan = learningPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());
        plan.setTopic(request.getTopic());
        plan.setResources(request.getResources());
        plan.setStartDate(request.getStartDate());
        plan.setTargetDate(request.getTargetDate());

        // Update Steps: Clear existing and add new ones (simpler approach for updates)
        if (request.getSteps() != null) {
            plan.getSteps().clear(); // OrphanRemoval will delete these from DB

            for (LearningPlanRequest.StepRequest stepReq : request.getSteps()) {
                PlanStep step = new PlanStep();
                step.setTitle(stepReq.getTitle());
                step.setResourceLink(stepReq.getResourceLink());
                step.setEstimatedTime(stepReq.getEstimatedTime());
                step.setCompleted(false);
                step.setLearningPlan(plan);
                plan.getSteps().add(step);
            }
        }

        return learningPlanRepository.save(plan);
    }

    @Transactional
    public void deletePlan(Long planId) {
        learningPlanRepository.deleteById(planId);
    }

    @Transactional
    public void toggleStep(Long stepId) {
        PlanStep step = planStepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));

        step.setCompleted(!step.isCompleted());
        planStepRepository.save(step);
    }
}