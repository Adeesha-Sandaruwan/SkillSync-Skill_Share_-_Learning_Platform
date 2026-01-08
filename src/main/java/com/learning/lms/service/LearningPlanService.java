package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.entity.PlanStep;
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository;
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

    @Transactional
    public LearningPlan createPlan(Long userId, LearningPlanRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());

        // Keep your original optional fields
        plan.setTopic(request.getTopic());
        plan.setResources(request.getResources());
        plan.setStartDate(request.getStartDate());
        plan.setTargetDate(request.getTargetDate());

        plan.setUser(user);

        // --- LOGIC TO SAVE STEPS ---
        if (request.getSteps() != null) {
            List<PlanStep> steps = request.getSteps().stream().map(s -> {
                PlanStep step = new PlanStep();
                step.setTitle(s.getTitle());
                step.setResourceLink(s.getResourceLink());
                step.setEstimatedTime(s.getEstimatedTime());
                step.setCompleted(false);
                step.setLearningPlan(plan); // Link back to parent
                return step;
            }).collect(Collectors.toList());

            plan.setSteps(steps);
        }

        return planRepository.save(plan);
    }

    public List<LearningPlan> getUserPlans(Long userId) {
        return planRepository.findByUserId(userId);
    }

    public LearningPlan updatePlan(Long planId, LearningPlanRequest request) {
        LearningPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Plan not found"));

        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setCategory(request.getCategory());
        plan.setDifficulty(request.getDifficulty());
        plan.setTopic(request.getTopic());
        plan.setResources(request.getResources());
        plan.setTargetDate(request.getTargetDate());

        return planRepository.save(plan);
    }

    public void deletePlan(Long planId) {
        planRepository.deleteById(planId);
    }
}