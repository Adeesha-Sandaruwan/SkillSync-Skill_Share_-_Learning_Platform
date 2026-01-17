package com.learning.lms.controller;

import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

    private final UserRepository userRepository;
    private final SkillPostRepository postRepository;
    private final LearningPlanRepository planRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getPublicStats() {
        return ResponseEntity.ok(Map.of(
                "users", userRepository.count(),
                "posts", postRepository.count(),
                "plans", planRepository.count()
        ));
    }
}