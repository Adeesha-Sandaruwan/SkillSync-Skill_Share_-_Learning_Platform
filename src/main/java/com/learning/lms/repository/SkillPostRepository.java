package com.learning.lms.repository;

import com.learning.lms.entity.SkillPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface SkillPostRepository extends JpaRepository<SkillPost, Long> {

    // Standard: Get all posts sorted by date
    List<SkillPost> findAllByOrderByCreatedAtDesc();

    // Standard: Get specific user's posts
    List<SkillPost> findByUserIdOrderByCreatedAtDesc(Long userId);

    // NEW: Get posts ONLY from users that I follow
    @Query("SELECT p FROM SkillPost p WHERE p.user.id IN " +
            "(SELECT f.id FROM User u JOIN u.following f WHERE u.id = :userId) " +
            "ORDER BY p.createdAt DESC")
    List<SkillPost> findPostsByFollowedUsers(@Param("userId") Long userId);
}