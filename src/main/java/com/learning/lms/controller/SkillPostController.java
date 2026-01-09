package com.learning.lms.controller;

import com.learning.lms.entity.SkillPost;
import com.learning.lms.enums.ReactionType;
import com.learning.lms.service.SkillPostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class SkillPostController {

    private final SkillPostService postService;

    @GetMapping
    public ResponseEntity<List<SkillPost>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getAllPosts(page, size));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<SkillPost>> getFeed(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getFollowingPosts(userId, page, size));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SkillPost>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(postService.getUserPosts(userId, page, size));
    }

    // --- CREATE / REPOST ---
    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<SkillPost> createPost(
            @RequestParam Long userId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) MultipartFile image,
            @RequestParam(required = false) Long originalPostId
    ) {
        return ResponseEntity.ok(postService.createPost(userId, description, image, originalPostId));
    }

    // --- REACTION ---
    @PostMapping("/{postId}/react")
    public ResponseEntity<SkillPost> reactToPost(
            @PathVariable Long postId,
            @RequestParam Long userId,
            @RequestParam ReactionType type
    ) {
        return ResponseEntity.ok(postService.reactToPost(postId, userId, type));
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId) {
        postService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{postId}")
    public ResponseEntity<SkillPost> updatePost(@PathVariable Long postId, @RequestBody String desc) {
        return ResponseEntity.ok(postService.updatePost(postId, desc));
    }
}