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

    @EntityGraph(attributePaths = {"user", "steps"})
    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "steps"})
    List<LearningPlan> findByUserId(Long userId);

    @EntityGraph(attributePaths = {"user", "steps"})
    List<LearningPlan> findByIsPublicTrueOrderByCreatedAtDesc();

    // --- FIXED SEARCH QUERY ---
    // Uses EXISTS for tags to avoid join duplication issues
    @Query("SELECT DISTINCT p FROM LearningPlan p " +
            "LEFT JOIN FETCH p.user " +
            "WHERE p.isPublic = true AND " +
            "(:query IS NULL OR :query = '' OR " +
            "   LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "   LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "   EXISTS (SELECT t FROM p.tags t WHERE LOWER(t) LIKE LOWER(CONCAT('%', :query, '%')))" +
            ") AND " +
            "(:difficulty = 'All' OR LOWER(TRIM(p.difficulty)) = LOWER(TRIM(:difficulty))) AND " +
            "(:category = 'All' OR LOWER(TRIM(p.category)) = LOWER(TRIM(:category))) " +
            "ORDER BY p.createdAt DESC")
    List<LearningPlan> searchPlans(
            @Param("query") String query,
            @Param("difficulty") String difficulty,
            @Param("category") String category
    );
}