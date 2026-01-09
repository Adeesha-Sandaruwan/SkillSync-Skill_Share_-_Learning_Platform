package com.learning.lms.service;

import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.enums.NotificationType;
import com.learning.lms.enums.ReactionType;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SkillPostService {

    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<SkillPost> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findAllPosts(pageable).getContent();
    }

    public List<SkillPost> getFollowingPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findPostsByFollowedUsers(userId, pageable).getContent();
    }

    public List<SkillPost> getUserPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return postRepository.findByUserId(userId, pageable).getContent();
    }

    @Transactional
    public SkillPost createPost(Long userId, String description, List<MultipartFile> mediaFiles, Long originalPostId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        SkillPost post = new SkillPost();
        post.setDescription(description != null ? description : "");
        post.setUser(user);

        // 1. Handle Repost
        if (originalPostId != null) {
            SkillPost original = postRepository.findById(originalPostId)
                    .orElseThrow(() -> new RuntimeException("Original post not found"));
            post.setOriginalPost(original.getOriginalPost() != null ? original.getOriginalPost() : original);
        }

        // 2. Handle Multiple Media Uploads
        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            if (mediaFiles.size() > 3) {
                throw new RuntimeException("Maximum 3 media files allowed.");
            }

            String uploadDir = "uploads";
            Path uploadPath = Paths.get(uploadDir);
            try {
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);

                for (MultipartFile file : mediaFiles) {
                    if (!file.isEmpty()) {
                        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

                        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/uploads/")
                                .path(filename)
                                .toUriString();

                        post.getMediaUrls().add(fileUrl);
                    }
                }
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload media");
            }
        }

        return postRepository.save(post);
    }

    @Transactional
    public SkillPost reactToPost(Long postId, Long userId, ReactionType type) {
        SkillPost post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (post.getReactions().containsKey(userId) && post.getReactions().get(userId) == type) {
            post.getReactions().remove(userId);
        } else {
            post.getReactions().put(userId, type);
            if (!post.getUser().getId().equals(userId)) {
                notificationService.createNotification(post.getUser(), user, NotificationType.LIKE, "reacted " + type + " to your post", post.getId());
            }
        }
        return postRepository.save(post);
    }

    @Transactional
    public void deletePost(Long postId) {
        postRepository.deleteById(postId);
    }

    @Transactional
    public SkillPost updatePost(Long postId, String desc) {
        SkillPost post = postRepository.findById(postId).orElseThrow();
        post.setDescription(desc);
        return postRepository.save(post);
    }
}