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
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SkillPostService {

    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // --- PAGINATION METHODS ---
    public List<SkillPost> getAllPosts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Slice<SkillPost> slice = postRepository.findAllPosts(pageable);
        return slice.getContent();
    }

    public List<SkillPost> getFollowingPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Slice<SkillPost> slice = postRepository.findPostsByFollowedUsers(userId, pageable);
        return slice.getContent();
    }

    public List<SkillPost> getUserPosts(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Slice<SkillPost> slice = postRepository.findByUserId(userId, pageable);
        return slice.getContent();
    }

    // --- CREATE POST WITH IMAGE UPLOAD ---
    @Transactional
    public SkillPost createPost(Long userId, String description, MultipartFile imageFile) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String imageUrl = null;

        // File Upload Logic
        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                // 1. Create uploads directory if it doesn't exist
                String uploadDir = System.getProperty("user.dir") + "/uploads";
                Path uploadPath = Paths.get(uploadDir);
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                // 2. Generate unique filename (UUID)
                String originalFilename = imageFile.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String newFilename = UUID.randomUUID().toString() + extension;

                // 3. Save file
                Path filePath = uploadPath.resolve(newFilename);
                Files.copy(imageFile.getInputStream(), filePath);

                // 4. Generate URL (This matches the WebConfig mapping)
                imageUrl = "http://localhost:8080/uploads/" + newFilename;

            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image: " + e.getMessage());
            }
        }

        SkillPost post = SkillPost.builder()
                .description(description)
                .imageUrl(imageUrl)
                .user(user)
                .build();

        return postRepository.save(post);
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