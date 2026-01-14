package com.learning.lms.controller;

import com.learning.lms.dto.UserStatsResponse;
import com.learning.lms.dto.UserSummaryDto;
import com.learning.lms.dto.UserUpdateRequest;
import com.learning.lms.entity.User;
import com.learning.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserById(((User) userDetails).getId());
        return ResponseEntity.ok(user);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<User> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
                                              @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(userService.updateUser(((User) userDetails).getId(), request));
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<String> uploadAvatar(@AuthenticationPrincipal UserDetails userDetails,
                                               @RequestParam("file") MultipartFile file) {
        String fileUrl = userService.uploadAvatar(((User) userDetails).getId(), file);
        return ResponseEntity.ok(fileUrl);
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<Void> followUser(@AuthenticationPrincipal UserDetails currentUser,
                                           @PathVariable Long userId) {
        userService.followUser(((User) currentUser).getId(), userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{userId}/unfollow")
    public ResponseEntity<Void> unfollowUser(@AuthenticationPrincipal UserDetails currentUser,
                                             @PathVariable Long userId) {
        userService.unfollowUser(((User) currentUser).getId(), userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{userId}/isFollowing")
    public ResponseEntity<Boolean> isFollowing(@AuthenticationPrincipal UserDetails currentUser,
                                               @PathVariable Long userId) {
        return ResponseEntity.ok(userService.isFollowing(((User) currentUser).getId(), userId));
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<UserStatsResponse> getUserStats(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUserStats(userId));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<User>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<User>> getSuggestions(@AuthenticationPrincipal UserDetails currentUser) {
        return ResponseEntity.ok(userService.getSuggestions(((User) currentUser).getId()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryDto>> searchUsers(@RequestParam("query") String query) {
        return ResponseEntity.ok(userService.searchUsers(query));
    }
    // --- FIX FOR 404 ERROR ---
    @GetMapping("/{userId}/following")
    public ResponseEntity<List<UserSummaryDto>> getUserFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getFollowing(userId));
    }

    // --- FIX FOR SUGGESTION SIDEBAR 404 ---
    @GetMapping("/{userId}/suggestions")
    public ResponseEntity<List<User>> getSuggestionsForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getSuggestions(userId));
    }
}