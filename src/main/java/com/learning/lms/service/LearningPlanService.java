package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.entity.PlanStep;
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.PlanStepRepository; // Import this
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository planRepository;
    private final UserRepository userRepository;
    private final PlanStepRepository stepRepository; // Add this injection

    @Transactional
    public LearningPlan createPlan(Long userId, LearningPlanRequest request) {
        // ... (Your existing create logic stays exactly the same) ...
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

        if (request.getSteps() != null) {
            List<PlanStep> steps = request.getSteps().stream().map(s -> {
                PlanStep step = new PlanStep();
                step.setTitle(s.getTitle());
                step.setResourceLink(s.getResourceLink());
                step.setEstimatedTime(s.getEstimatedTime());
                step.setCompleted(false);
                step.setLearningPlan(plan);
                return step;
            }).collect(Collectors.toList());
            plan.setSteps(steps);
        }
        return planRepository.save(plan);
    }

    // ... (getUserPlans, updatePlan, deletePlan stay the same) ...

    public List<LearningPlan> getUserPlans(Long userId) {
        return planRepository.findByUserId(userId);
    }

    public LearningPlan updatePlan(Long planId, LearningPlanRequest request) {
        LearningPlan plan = planRepository.findById(planId).orElseThrow(() -> new RuntimeException("Plan not found"));
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setTopic(request.getTopic());
        plan.setResources(request.getResources());
        plan.setTargetDate(request.getTargetDate());
        return planRepository.save(plan);
    }

    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
    }

    // --- ADD THIS NEW METHOD ---
    public void toggleStep(Long stepId) {
        PlanStep step = stepRepository.findById(stepId)
                .orElseThrow(() -> new RuntimeException("Step not found"));
        step.setCompleted(!step.isCompleted()); // Flip true/false
        stepRepository.save(step);
    }
}