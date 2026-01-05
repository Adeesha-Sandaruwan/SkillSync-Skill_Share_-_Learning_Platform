package com.learning.lms.repository;

import com.learning.lms.entity.ProgressUpdate;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProgressUpdateRepository extends JpaRepository<ProgressUpdate, Long> {
    List<ProgressUpdate> findByUserIdOrderByPostedAtDesc(Long userId);
}