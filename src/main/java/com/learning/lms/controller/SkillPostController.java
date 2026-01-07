package com.learning.lms.controller;

import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.repository.UserRepository;
import com.learning.lms.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class SkillPostController {

    private final SkillPostService skillPostService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<SkillPost>> getAllPosts() {
        return ResponseEntity.ok(skillPostService.getAllPosts());
    }

    @GetMapping("/feed")
    public ResponseEntity<List<SkillPost>> getFeed(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(skillPostService.getFollowingPosts(user.getId()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SkillPost>> getUserPosts(@PathVariable Long userId) {
        return ResponseEntity.ok(skillPostService.getUserPosts(userId));
    }

    @PostMapping
    public ResponseEntity<SkillPost> createPost(
            @RequestBody SkillPost postRequest,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(
                skillPostService.createPost(user.getId(), postRequest.getDescription(), postRequest.getImageUrl())
        );
    }

    @PutMapping("/{postId}")
    public ResponseEntity<SkillPost> updatePost(
            @PathVariable Long postId,
            @RequestBody SkillPost postRequest
    ) {
        return ResponseEntity.ok(skillPostService.updatePost(postId, postRequest.getDescription()));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        skillPostService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{postId}/like")
    public ResponseEntity<SkillPost> toggleLike(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(skillPostService.toggleLike(postId, user.getId()));
    }

    @PostMapping("/{postId}/like")
    public ResponseEntity<SkillPost> toggleLikePost(
            @PathVariable Long postId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return toggleLike(postId, userDetails);
    }
}