package com.learning.lms.controller;

import com.learning.lms.dto.UserSummaryDto;
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

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<SkillPost> createPost(
            @RequestParam Long userId,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) List<MultipartFile> media,
            @RequestParam(required = false) Long originalPostId,
            @RequestParam(required = false) Long learningPlanId
    ) {
        return ResponseEntity.ok(postService.createPost(userId, description, media, originalPostId, learningPlanId));
    }

    @PostMapping("/{postId}/react")
    public ResponseEntity<SkillPost> reactToPost(
            @PathVariable Long postId,
            @RequestParam Long userId,
            @RequestParam ReactionType type
    ) {
        return ResponseEntity.ok(postService.reactToPost(postId, userId, type));
    }

    @GetMapping("/{postId}/reactions")
    public ResponseEntity<List<UserSummaryDto>> getPostReactions(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.getPostReactions(postId));
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

    // --- NEW SEARCH ENDPOINT ---
    @GetMapping("/search")
    public ResponseEntity<List<SkillPost>> searchPosts(@RequestParam("query") String query) {
        return ResponseEntity.ok(postService.searchPosts(query));
    }
}