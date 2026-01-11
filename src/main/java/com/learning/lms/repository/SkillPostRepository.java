package com.learning.lms.repository;

import com.learning.lms.entity.SkillPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkillPostRepository extends JpaRepository<SkillPost, Long> {

    // 1. Feed Query (Followed Users + Self)
    @Query("SELECT DISTINCT p FROM SkillPost p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH p.comments c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE p.user.id IN " +
            "(SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId) " +
            "OR p.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    Slice<SkillPost> findPostsByFollowedUsers(@Param("userId") Long userId, Pageable pageable);

    // 2. Global Feed
    @Query("SELECT DISTINCT p FROM SkillPost p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH p.comments c " +
            "LEFT JOIN FETCH c.user " +
            "ORDER BY p.createdAt DESC")
    Slice<SkillPost> findAllPosts(Pageable pageable);

    // 3. Profile Posts Tab
    @Query("SELECT DISTINCT p FROM SkillPost p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH p.comments c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE p.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    Slice<SkillPost> findByUserId(Long userId, Pageable pageable);

    // 4. Profile Progress Tab (List)
    // Fetches posts that are either linked to a plan OR have a special tag like [MILESTONE]
    @Query("SELECT p FROM SkillPost p WHERE p.user.id = :userId AND " +
            "(p.learningPlan IS NOT NULL OR p.description LIKE '[%]') " +
            "ORDER BY p.createdAt DESC")
    List<SkillPost> findProgressUpdatesByUserId(Long userId);

    // Legacy support
    int countByUserId(Long userId);
    List<SkillPost> findByUserIdOrderByCreatedAtDesc(Long userId);
}