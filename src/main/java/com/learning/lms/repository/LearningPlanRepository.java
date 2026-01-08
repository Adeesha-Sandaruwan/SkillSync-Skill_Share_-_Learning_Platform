package com.learning.lms.repository;

import com.learning.lms.entity.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    // Used by LearningPlanService for the specific ordered list
    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Used by UserService (Fixes the "cannot find symbol" error)
    List<LearningPlan> findByUserId(Long userId);
}