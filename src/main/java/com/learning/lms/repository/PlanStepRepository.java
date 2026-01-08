package com.learning.lms.repository;

import com.learning.lms.entity.PlanStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PlanStepRepository extends JpaRepository<PlanStep, Long> {

    @Query("SELECT COUNT(s) FROM PlanStep s JOIN s.learningPlan p WHERE p.user.id = :userId AND s.isCompleted = true")
    int countCompletedStepsByUserId(@Param("userId") Long userId);
}