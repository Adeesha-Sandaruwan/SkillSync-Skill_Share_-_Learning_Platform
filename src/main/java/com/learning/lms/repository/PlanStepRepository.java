package com.learning.lms.repository;

import com.learning.lms.entity.PlanStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanStepRepository extends JpaRepository<PlanStep, Long> {

    @Query("SELECT COUNT(s) FROM PlanStep s WHERE s.learningPlan.user.id = :userId AND s.isCompleted = true")
    int countCompletedStepsByUserId(Long userId);
}