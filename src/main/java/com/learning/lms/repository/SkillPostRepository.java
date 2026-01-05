package com.learning.lms.repository;

import com.learning.lms.entity.SkillPost;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SkillPostRepository extends JpaRepository<SkillPost, Long> {
    List<SkillPost> findByUserIdOrderByCreatedAtDesc(Long userId);
}