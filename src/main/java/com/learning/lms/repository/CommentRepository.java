package com.learning.lms.repository;

import com.learning.lms.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    // This is the missing method that caused the error
    List<Comment> findByPostIdOrderByCreatedAtDesc(Long postId);
}