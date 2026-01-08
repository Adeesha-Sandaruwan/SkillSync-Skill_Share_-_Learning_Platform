package com.learning.lms.repository;

import com.learning.lms.entity.SkillPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SkillPostRepository extends JpaRepository<SkillPost, Long> {

    // Standard finds
    List<SkillPost> findAllByOrderByCreatedAtDesc();
    List<SkillPost> findByUserIdOrderByCreatedAtDesc(Long userId);
    // Just ensure this line is inside SkillPostRepository interface:
    int countByUserId(Long userId);
    // The MISSING method your Service was looking for
    // This fetches posts from users that I follow, PLUS my own posts
    @Query("SELECT p FROM SkillPost p WHERE p.user.id IN " +
            "(SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId) " +
            "OR p.user.id = :userId " +
            "ORDER BY p.createdAt DESC")
    List<SkillPost> findPostsByFollowedUsers(@Param("userId") Long userId);
}