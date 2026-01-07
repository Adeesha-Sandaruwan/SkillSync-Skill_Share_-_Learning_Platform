package com.learning.lms.controller;

import com.learning.lms.dto.CommentRequest;
import com.learning.lms.entity.Comment;
import com.learning.lms.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // POST (Add Comment)
    @PostMapping("/posts/{postId}/users/{userId}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable Long userId,
            @PathVariable Long postId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        if (userDetails != null) {
            return ResponseEntity.ok(commentService.addCommentByUsername(userDetails.getUsername(), postId, request));
        }
        return ResponseEntity.ok(commentService.addComment(userId, postId, request));
    }

    // POST (Add Comment) - preferred (uses JWT principal)
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Comment> addCommentToPost(
            @PathVariable Long postId,
            @RequestBody CommentRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(commentService.addCommentByUsername(userDetails.getUsername(), postId, request));
    }

    // GET (List Comments)
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long postId) {
        return ResponseEntity.ok(commentService.getCommentsByPostId(postId));
    }

    // PUT (Edit Comment)
    @PutMapping("/comments/{commentId}")
    public ResponseEntity<Comment> editComment(
            @PathVariable Long commentId,
            @RequestBody CommentRequest request) {
        return ResponseEntity.ok(commentService.editComment(commentId, request));
    }

    // DELETE (Remove Comment)
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}