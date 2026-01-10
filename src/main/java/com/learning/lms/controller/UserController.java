package com.learning.lms.controller;

import com.learning.lms.dto.UserStatsResponse;
import com.learning.lms.dto.UserUpdateRequest;
import com.learning.lms.entity.User;
import com.learning.lms.repository.UserRepository;
import com.learning.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<User>> searchUsers(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(userRepository.searchUsers(query));
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUserProfile(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<Void> followUser(@PathVariable Long userId, @RequestParam Long followerId) {
        userService.followUser(followerId, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<Void> unfollowUser(@PathVariable Long userId, @RequestParam Long followerId) {
        userService.unfollowUser(followerId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/is-following")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long userId, @RequestParam Long followerId) {
        return ResponseEntity.ok(userService.isFollowing(followerId, userId));
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserStats(userId));
    }

    // --- GAMIFICATION ENDPOINT ---
    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        // Return top 10 users for efficiency
        List<User> topUsers = userService.getLeaderboard().stream().limit(10).collect(Collectors.toList());
        return ResponseEntity.ok(topUsers);
    }
}