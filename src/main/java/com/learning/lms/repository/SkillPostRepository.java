package com.learning.lms.repository;

import com.learning.lms.entity.SkillPost;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkillPostRepository extends JpaRepository<SkillPost, Long> {

    // --- NEW: Paginated Methods (Used by Feed) ---

    // Uses JOIN FETCH to prevent LazyInitializationException
    @Query("SELECT DISTINCT p FROM SkillPost p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH p.comments c " +
            "LEFT JOIN FETCH c.user " +
            "ORDER BY p.createdAt DESC")
    Slice<SkillPost> findAllPosts(Pageable pageable);

    @Query("SELECT DISTINCT p FROM SkillPost p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH p.comments c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE p.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    Slice<SkillPost> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT DISTINCT p FROM SkillPost p " +
            "LEFT JOIN FETCH p.user " +
            "LEFT JOIN FETCH p.comments c " +
            "LEFT JOIN FETCH c.user " +
            "WHERE p.user.id IN " +
            "(SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId) " +
            "OR p.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    Slice<SkillPost> findPostsByFollowedUsers(@Param("userId") Long userId, Pageable pageable);

    // --- LEGACY: List Methods (Restored for UserService compatibility) ---

    // Kept to fix the UserService compilation error
    List<SkillPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SkillPost> findAllByOrderByCreatedAtDesc();

    int countByUserId(Long userId);
}