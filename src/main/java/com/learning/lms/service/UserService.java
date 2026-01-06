package com.learning.lms.service;

import com.learning.lms.dto.LoginRequest;
import com.learning.lms.dto.RegisterRequest;
import com.learning.lms.dto.UserUpdateRequest;
import com.learning.lms.entity.User;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import this

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ... (Keep register, login, getUserById, updateUser as they are) ...

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

    // --- FIXED FOLLOW METHODS ---

    @Transactional // Ensures the database handles the relationship safely
    public void followUser(Long followerId, Long targetUserId) {
        if (followerId.equals(targetUserId)) {
            throw new RuntimeException("You cannot follow yourself");
        }

        User follower = getUserById(followerId);
        User target = getUserById(targetUserId);

        follower.follow(target);
        userRepository.save(follower);
    }

    @Transactional // Ensures the database handles the relationship safely
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
    public long getFollowerCount(Long userId) {
        return getUserById(userId).getFollowers().size();
    }

    @Transactional(readOnly = true)
    public long getFollowingCount(Long userId) {
        return getUserById(userId).getFollowing().size();
    }
}