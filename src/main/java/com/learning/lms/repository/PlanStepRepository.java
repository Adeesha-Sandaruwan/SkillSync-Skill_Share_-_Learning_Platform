package com.learning.lms.repository;

import com.learning.lms.entity.PlanStep;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PlanStepRepository extends JpaRepository<PlanStep, Long> {
}