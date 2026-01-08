package com.learning.lms.service;

import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.enums.NotificationType;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillPostService {

    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // Updated for Pagination
    public List<SkillPost> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Slice<SkillPost> slice = postRepository.findAllPosts(pageable);
        return slice.getContent();
    }

    // Updated for Pagination
    public List<SkillPost> getFollowingPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Slice<SkillPost> slice = postRepository.findPostsByFollowedUsers(userId, pageable);
        return slice.getContent();
    }

    // Updated for Pagination
    public List<SkillPost> getUserPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Slice<SkillPost> slice = postRepository.findByUserId(userId, pageable);
        return slice.getContent();
    }

    @Transactional
    public SkillPost createPost(Long userId, String description, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SkillPost post = SkillPost.builder()
                .description(description)
                .imageUrl(imageUrl)
                .user(user)
                .build();

        return postRepository.save(post);
    }

    @Transactional
    public SkillPost createPost(Long userId, SkillPost postData) {
        return createPost(userId, postData.getDescription(), postData.getImageUrl());
    }

    @Transactional
    public SkillPost updatePost(Long postId, String newDescription) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setDescription(newDescription);
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }
        postRepository.deleteById(postId);
    }

    @Transactional
    public SkillPost toggleLike(Long postId, Long userId) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User liker = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getLikedUserIds().contains(userId)) {
            post.getLikedUserIds().remove(userId);
        } else {
            post.getLikedUserIds().add(userId);

            if (!post.getUser().getId().equals(userId)) {
                notificationService.createNotification(
                        post.getUser(),
                        liker,
                        NotificationType.LIKE,
                        "liked your skill post.",
                        post.getId()
                );
            }
        }

        return postRepository.save(post);
    }
}