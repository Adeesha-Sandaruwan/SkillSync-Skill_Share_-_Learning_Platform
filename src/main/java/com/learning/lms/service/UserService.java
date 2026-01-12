package com.learning.lms.service;

import com.learning.lms.dto.LoginRequest;
import com.learning.lms.dto.RegisterRequest;
import com.learning.lms.dto.UserStatsResponse;
import com.learning.lms.dto.UserUpdateRequest;
import com.learning.lms.entity.User;
import com.learning.lms.enums.NotificationType;
import com.learning.lms.repository.LearningPlanRepository;
import com.learning.lms.repository.PlanStepRepository;
import com.learning.lms.repository.SkillPostRepository;
import com.learning.lms.repository.UserRepository;
import com.learning.lms.util.ImageUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    private final SkillPostRepository skillPostRepository;
    private final LearningPlanRepository learningPlanRepository;
    private final PlanStepRepository planStepRepository;

    private final String UPLOAD_DIR = "uploads/";

    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email already registered");
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setXp(0);
        user.setLevel(1);
        user.getBadges().add("NOVICE");
        return userRepository.save(user);
    }

    public User loginUser(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) throw new RuntimeException("Invalid credentials");
        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    public User updateUser(Long userId, UserUpdateRequest request) {
        User user = getUserById(userId);
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("Username already taken");
            }
            user.setUsername(request.getUsername());
        }
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        return userRepository.save(user);
    }

    @Transactional
    public String uploadAvatar(Long userId, MultipartFile file) {
        try {
            User user = getUserById(userId);

            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) directory.mkdirs();

            String fileName = "avatar_" + userId + "_" + UUID.randomUUID() + ".jpg";
            Path filePath = Paths.get(UPLOAD_DIR + fileName);

            byte[] compressedImage = ImageUtils.compressImage(file);
            Files.write(filePath, compressedImage);

            String fileUrl = "http://localhost:8080/uploads/" + fileName;
            user.setAvatarUrl(fileUrl);
            userRepository.save(user);

            return fileUrl;
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @Transactional
    public void followUser(Long followerId, Long targetUserId) {
        if (followerId.equals(targetUserId)) throw new RuntimeException("You cannot follow yourself");
        User follower = getUserById(followerId);
        User target = getUserById(targetUserId);

        follower.follow(target);
        userRepository.save(follower);

        awardXp(followerId, 5);

        notificationService.createNotification(
                target, follower, NotificationType.FOLLOW, "started following you.", null
        );
    }

    @Transactional
    public void unfollowUser(Long followerId, Long targetUserId) {
        User follower = getUserById(followerId);
        User target = getUserById(targetUserId);
        follower.unfollow(target);
        userRepository.save(follower);
    }

    public boolean isFollowing(Long followerId, Long targetUserId) {
        User follower = getUserById(followerId);
        User target = getUserById(targetUserId);
        return follower.getFollowing().contains(target);
    }

    @Transactional(readOnly = true)
    public UserStatsResponse getUserStats(Long userId) {
        int postCount = skillPostRepository.countByUserId(userId);
        int likeCount = skillPostRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .mapToInt(p -> p.getReactions().size()).sum();
        int planCount = 0;
        try { planCount = learningPlanRepository.findByUserId(userId).size(); } catch (Exception e) {}
        int stepsCompleted = 0;
        try { stepsCompleted = planStepRepository.countCompletedStepsByUserId(userId); } catch (Exception e) {}

        User user = getUserById(userId);
        return new UserStatsResponse(postCount, likeCount, planCount, stepsCompleted, user.getFollowers().size(), user.getFollowing().size());
    }

    @Transactional
    public void awardXp(Long userId, int amount) {
        User user = getUserById(userId);
        user.setXp(user.getXp() + amount);

        int newLevel = (user.getXp() / 100) + 1;
        if (newLevel > user.getLevel()) {
            user.setLevel(newLevel);
        }

        if (user.getXp() >= 50 && !user.getBadges().contains("APPRENTICE")) {
            user.getBadges().add("APPRENTICE");
        }
        if (user.getXp() >= 500 && !user.getBadges().contains("MASTER")) {
            user.getBadges().add("MASTER");
        }
        if (user.getFollowers().size() >= 5 && !user.getBadges().contains("SOCIALITE")) {
            user.getBadges().add("SOCIALITE");
        }

        userRepository.save(user);
    }

    public List<User> getLeaderboard() {
        return userRepository.findAll(Sort.by("xp").descending());
    }

    public List<User> getSuggestions(Long currentUserId) {
        List<User> candidates = userRepository.findSuggestedUsers(currentUserId, PageRequest.of(0, 20));
        Collections.shuffle(candidates);
        return candidates.stream().limit(5).toList();
    }
}