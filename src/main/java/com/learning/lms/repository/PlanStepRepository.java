package com.learning.lms.repository;

import com.learning.lms.entity.PlanStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlanStepRepository extends JpaRepository<PlanStep, Long> {

    // 1. Get all steps for a specific plan
    List<PlanStep> findByLearningPlanId(Long planId);

    // 2. Count COMPLETED steps for a specific User (Fixes your error)
    // The query joins PlanStep -> LearningPlan -> User to filter by userId
    @Query("SELECT COUNT(s) FROM PlanStep s WHERE s.learningPlan.user.id = :userId AND s.completed = true")
    int countCompletedStepsByUserId(@Param("userId") Long userId);
}