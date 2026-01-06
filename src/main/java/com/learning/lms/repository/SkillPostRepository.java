package com.learning.lms.repository;

import com.learning.lms.entity.SkillPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillPostRepository extends JpaRepository<SkillPost, Long> {

    // This was the missing method causing your error
    List<SkillPost> findAllByOrderByCreatedAtDesc();

    // This fetches posts for a specific user profile
    List<SkillPost> findByUserIdOrderByCreatedAtDesc(Long userId);
}