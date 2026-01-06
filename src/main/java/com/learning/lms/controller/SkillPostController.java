package com.learning.lms.controller;

import com.learning.lms.entity.SkillPost;
import com.learning.lms.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SkillPostController {

    private final SkillPostService postService;

    @GetMapping("/posts")
    public List<SkillPost> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/users/{userId}/posts")
    public List<SkillPost> getUserPosts(@PathVariable Long userId) {
        return postService.getUserPosts(userId);
    }

    @PostMapping("/users/{userId}/posts")
    public SkillPost createPost(@PathVariable Long userId, @RequestBody SkillPost post) {
        return postService.createPost(userId, post);
    }

    @PutMapping("/posts/{postId}")
    public ResponseEntity<SkillPost> updatePost(@PathVariable Long postId, @RequestBody Map<String, String> payload) {
        return ResponseEntity.ok(postService.updatePost(postId, payload.get("description")));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    // NEW: Like Endpoint
    @PostMapping("/posts/{postId}/like")
    public ResponseEntity<SkillPost> toggleLike(@PathVariable Long postId, @RequestParam Long userId) {
        return ResponseEntity.ok(postService.toggleLike(postId, userId));
    }
}