package com.learning.lms.service;

import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillPostService {

    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;

    public List<SkillPost> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<SkillPost> getUserPosts(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public SkillPost createPost(Long userId, SkillPost postData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        postData.setUser(user);
        return postRepository.save(postData);
    }

    public SkillPost updatePost(Long postId, String newDescription) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.setDescription(newDescription);
        return postRepository.save(post);
    }

    public void deletePost(Long postId) {
        if (!postRepository.existsById(postId)) {
            throw new RuntimeException("Post not found");
        }
        postRepository.deleteById(postId);
    }

    // NEW: Toggle Like
    public SkillPost toggleLike(Long postId, Long userId) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (post.getLikedUserIds().contains(userId)) {
            post.getLikedUserIds().remove(userId); // Unlike
        } else {
            post.getLikedUserIds().add(userId); // Like
        }

        return postRepository.save(post);
    }


    // NEW: Get Following Feed
    public List<SkillPost> getFollowingPosts(Long userId) {
        return postRepository.findPostsByFollowedUsers(userId);
    }
}