package com.learning.lms.repository;

import com.learning.lms.entity.LearningPlan;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {

    @EntityGraph(attributePaths = {"user"})
    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<LearningPlan> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<LearningPlan> findByIsPublicTrueOrderByCreatedAtDesc();

    // --- HOTFIX: Removed 'description' from search to bypass DB crash ---
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM LearningPlan p WHERE " +
            "p.isPublic = true AND " +
            "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:difficulty = 'All' OR LOWER(TRIM(p.difficulty)) = LOWER(TRIM(:difficulty))) AND " +
            "(:category = 'All' OR LOWER(TRIM(p.category)) = LOWER(TRIM(:category))) " +
            "ORDER BY p.createdAt DESC")
    List<LearningPlan> searchPlans(
            @Param("query") String query,
            @Param("difficulty") String difficulty,
            @Param("category") String category
    );
}