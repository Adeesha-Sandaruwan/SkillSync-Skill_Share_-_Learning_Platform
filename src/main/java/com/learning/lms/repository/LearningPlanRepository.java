package com.learning.lms.repository;

import com.learning.lms.entity.LearningPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {

    // Keep these for profile/dashboard views
    @EntityGraph(attributePaths = {"user", "steps"})
    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "steps"})
    List<LearningPlan> findByUserId(Long userId);

    // This is the method we will use. We fetch User + Steps.
    // Tags will be lazy-loaded in the service (which is fine and safe).
    @EntityGraph(attributePaths = {"user", "steps"})
    List<LearningPlan> findByIsPublicTrueOrderByCreatedAtDesc();
}