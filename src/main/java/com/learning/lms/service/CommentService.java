package com.learning.lms.service;

import com.learning.lms.dto.CommentRequest;
import com.learning.lms.entity.Comment;
import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.enums.NotificationType;
import com.learning.lms.repository.CommentRepository;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService; // INJECTED

    public Comment addComment(Long userId, Long postId, CommentRequest request) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addCommentInternal(user, post, request);
    }

    public Comment addCommentByUsername(String username, Long postId, CommentRequest request) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addCommentInternal(user, post, request);
    }

    private Comment addCommentInternal(User user, SkillPost post, CommentRequest request) {
        String content = request != null ? request.getContent() : null;
        if (content == null) content = "";

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setPost(post);
        comment.setUser(user);

        Comment savedComment = commentRepository.save(comment);

        // TRIGGER NOTIFICATION
        String message;
        if (content.isBlank()) {
            message = "commented on your post.";
        } else {
            message = "commented on your post: " + (content.length() > 20 ? content.substring(0, 20) + "..." : content);
        }

        notificationService.createNotification(
                post.getUser(),
                user,
                NotificationType.COMMENT,
                message,
                post.getId()
        );

        return savedComment;
    }

    public List<Comment> getCommentsByPostId(Long postId) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId);
    }

    public Comment editComment(Long commentId, CommentRequest request) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        comment.setContent(request.getContent());
        return commentRepository.save(comment);
    }

    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}