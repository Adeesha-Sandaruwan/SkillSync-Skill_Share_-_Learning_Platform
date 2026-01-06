package com.learning.lms.service;

import com.learning.lms.dto.PostRequest;
import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;

    public SkillPost createPost(Long userId, PostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SkillPost post = new SkillPost();
        post.setDescription(request.getDescription());
        post.setMediaUrls(request.getMediaUrls());
        post.setUser(user);
        post.setLikeCount(0);

        return postRepository.save(post);
    }

    public List<SkillPost> getAllPosts() {
        return postRepository.findAll();
    }

    public List<SkillPost> getPostsByUserId(Long userId) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public SkillPost getPostById(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
    }

    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }
}