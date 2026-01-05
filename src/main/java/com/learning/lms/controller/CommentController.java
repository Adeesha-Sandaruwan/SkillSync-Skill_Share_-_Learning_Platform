package com.learning.lms.controller;

import com.learning.lms.dto.CommentRequest;
import com.learning.lms.entity.Comment;
import com.learning.lms.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // POST /api/posts/{postId}/users/{userId}/comments (Add Comment)
    @PostMapping("/posts/{postId}/users/{userId}/comments")
    public ResponseEntity<Comment> addComment(@PathVariable Long userId, @PathVariable Long postId, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.addComment(userId, postId, request));
    }

    // GET /api/posts/{postId}/comments (Get Comments for a post)
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    // PUT /api/comments/{commentId} (Edit Comment)
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> editComment(@PathVariable Long commentId, @Valid @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.editComment(commentId, request));
    }

    // DELETE /api/comments/{commentId} (Delete Comment)
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}