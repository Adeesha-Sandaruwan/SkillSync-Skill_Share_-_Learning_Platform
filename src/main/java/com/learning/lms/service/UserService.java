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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    private final SkillPostRepository skillPostRepository;
    private final LearningPlanRepository learningPlanRepository;
    private final PlanStepRepository planStepRepository;

    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) throw new RuntimeException("Username already taken");
        if (userRepository.existsByEmail(request.getEmail())) throw new RuntimeException("Email already registered");
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
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
    public void followUser(Long followerId, Long targetUserId) {
        if (followerId.equals(targetUserId)) throw new RuntimeException("You cannot follow yourself");

        User follower = getUserById(followerId);
        User target = getUserById(targetUserId);

        follower.follow(target);
        userRepository.save(follower);

        notificationService.createNotification(
                target,
                follower,
                NotificationType.FOLLOW,
                "started following you.",
                null
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
        // 1. Count Posts
        int postCount = skillPostRepository.countByUserId(userId);

        // 2. Count Total Reactions (Formerly Likes)
        // --- FIX: Changed getLikedUserIds() to getReactions() ---
        int likeCount = skillPostRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .mapToInt(p -> p.getReactions().size())
                .sum();

        // 3. Count Plans
        // Note: Ensure LearningPlanRepository exists and works, or this will fail
        int planCount = 0;
        try {
            planCount = learningPlanRepository.findByUserId(userId).size();
        } catch (Exception e) {
            // Fallback if repository is not fully set up yet
            planCount = 0;
        }

        // 4. Count Completed Steps
        int stepsCompleted = 0;
        try {
            stepsCompleted = planStepRepository.countCompletedStepsByUserId(userId);
        } catch (Exception e) {
            stepsCompleted = 0;
        }

        // 5. Real Follower/Following Counts
        User user = getUserById(userId);
        int followers = user.getFollowers().size();
        int following = user.getFollowing().size();

        return new UserStatsResponse(postCount, likeCount, planCount, stepsCompleted, followers, following);
    }

    @Transactional(readOnly = true)
    public long getFollowerCount(Long userId) {
        return getUserById(userId).getFollowers().size();
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        return getUserById(userId).getFollowing().size();
    }
}