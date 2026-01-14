package com.learning.lms.service;

import com.learning.lms.dto.UserSummaryDto;
import com.learning.lms.entity.LearningPlan;
import com.learning.lms.entity.SkillPost;
import com.learning.lms.entity.User;
import com.learning.lms.enums.NotificationType;
import com.learning.lms.enums.ReactionType;
import com.learning.lms.repository.LearningPlanRepository;
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
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillPostService {

    private final SkillPostRepository postRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final LearningPlanRepository learningPlanRepository;

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
    public SkillPost createSimplePost(Long userId, String content, String type) {
        User user = userRepository.findById(userId).orElseThrow();
        SkillPost post = new SkillPost();
        String formattedContent = type != null ? "[" + type + "] " + content : content;
        post.setDescription(formattedContent);
        post.setUser(user);
        return postRepository.save(post);
    }

    @Transactional
    public SkillPost createPost(Long userId, String description, List<MultipartFile> mediaFiles, Long originalPostId, Long learningPlanId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        SkillPost post = new SkillPost();
        post.setDescription(description != null ? description : "");
        post.setUser(user);

        if (originalPostId != null) {
            SkillPost original = postRepository.findById(originalPostId).orElseThrow();
            post.setOriginalPost(original.getOriginalPost() != null ? original.getOriginalPost() : original);
        }

        if (learningPlanId != null) {
            LearningPlan plan = learningPlanRepository.findById(learningPlanId).orElseThrow();
            post.setLearningPlan(plan);
        }

        if (mediaFiles != null && !mediaFiles.isEmpty()) {
            String uploadDir = "uploads";
            Path uploadPath = Paths.get(uploadDir);
            try {
                if (!Files.exists(uploadPath)) Files.createDirectories(uploadPath);
                for (MultipartFile file : mediaFiles) {
                    if (!file.isEmpty()) {
                        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        Files.copy(file.getInputStream(), uploadPath.resolve(filename));
                        String fileUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/").path(filename).toUriString();
                        post.getMediaUrls().add(fileUrl);
                    }
                }
            } catch (IOException e) { throw new RuntimeException("Failed to upload media"); }
        }
        return postRepository.save(post);
    }

    @Transactional
    public SkillPost reactToPost(Long postId, Long userId, ReactionType type) {
        SkillPost post = postRepository.findById(postId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        if (post.getReactions().containsKey(userId)) {
            ReactionType existingType = post.getReactions().get(userId);
            if (existingType == type) {
                post.getReactions().remove(userId);
            } else {
                post.getReactions().put(userId, type);
            }
        } else {
            post.getReactions().put(userId, type);
            if (!post.getUser().getId().equals(userId)) {
                notificationService.createNotification(post.getUser(), user, NotificationType.LIKE, "reacted " + type + " to your post", post.getId());
            }
        }
        return postRepository.saveAndFlush(post);
    }

    // --- LOGIC TO GET REACTORS ---
    @Transactional(readOnly = true)
    public List<UserSummaryDto> getPostReactions(Long postId) {
        SkillPost post = postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));
        Map<Long, ReactionType> reactions = post.getReactions();

        if (reactions.isEmpty()) return new ArrayList<>();

        List<User> users = userRepository.findAllById(reactions.keySet());

        return users.stream().map(user -> UserSummaryDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .avatarUrl(user.getAvatarUrl())
                .level(user.getLevel())
                .reactionType(reactions.get(user.getId()).name()) // Show what they reacted with
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public void deletePost(Long postId) { postRepository.deleteById(postId); }

    @Transactional
    public SkillPost updatePost(Long postId, String desc) {
        SkillPost post = postRepository.findById(postId).orElseThrow();
        post.setDescription(desc);
        return postRepository.save(post);
    }
}