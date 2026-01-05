package com.learning.lms.service;

import com.learning.lms.dto.LearningPlanRequest;
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.entity.User;
import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningPlanService {

    private final LearningPlanRepository planRepository;
    private final UserRepository userRepository;

    public LearningPlan createPlan(Long userId, LearningPlanRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        LearningPlan plan = new LearningPlan();
        plan.setTitle(request.getTitle());
        plan.setDescription(request.getDescription());
        plan.setTopic(request.getTopic());
        plan.setResources(request.getResources());
        plan.setStartDate(request.getStartDate());
        plan.setTargetDate(request.getTargetDate());
        plan.setUser(user);

        return planRepository.save(plan);
    }

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
}