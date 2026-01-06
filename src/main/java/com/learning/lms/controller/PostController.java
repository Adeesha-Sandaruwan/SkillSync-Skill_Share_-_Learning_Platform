package com.learning.lms.controller;

import com.learning.lms.dto.PostRequest;
import com.learning.lms.entity.SkillPost;
import com.learning.lms.service.PostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/users/{userId}/posts")
    public ResponseEntity<SkillPost> createPost(@PathVariable Long userId, @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.createPost(userId, request));
    }

    @GetMapping("/posts")
    public ResponseEntity<List<SkillPost>> getAllPosts() {
        return ResponseEntity.ok(postService.getAllPosts());
    }

    @GetMapping("/users/{userId}/posts")
    public ResponseEntity<List<SkillPost>> getUserPosts(@PathVariable Long userId) {
        return ResponseEntity.ok(postService.getPostsByUserId(userId));
    }

    @GetMapping("/posts/{postId}")
    public ResponseEntity<SkillPost> getPostById(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostById(postId));
    }

    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }
}