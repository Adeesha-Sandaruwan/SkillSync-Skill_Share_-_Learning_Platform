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

    // Fetch User + Plan in one go
    @EntityGraph(attributePaths = {"user"})
    List<LearningPlan> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user"})
    List<LearningPlan> findByUserId(Long userId);

    // For Discovery/Explore page - Crucial for speed
    @EntityGraph(attributePaths = {"user"})
    List<LearningPlan> findByIsPublicTrueOrderByCreatedAtDesc();

    // Advanced Search - Also fetches user instantly
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT p FROM LearningPlan p WHERE " +
            "p.isPublic = true AND " +
            "(:query IS NULL OR LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "(:difficulty = 'All' OR p.difficulty = :difficulty) AND " +
            "(:category = 'All' OR p.category = :category) " +
            "ORDER BY p.createdAt DESC")
    List<LearningPlan> searchPlans(
            @Param("query") String query,
            @Param("difficulty") String difficulty,
            @Param("category") String category
    );
}