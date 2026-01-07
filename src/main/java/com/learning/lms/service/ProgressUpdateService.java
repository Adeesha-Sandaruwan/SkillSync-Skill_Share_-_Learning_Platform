package com.learning.lms.service;

import com.learning.lms.entity.ProgressUpdate;
import com.learning.lms.entity.User;
import com.learning.lms.repository.ProgressUpdateRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgressUpdateService {

    private final ProgressUpdateRepository progressRepo;
    private final UserRepository userRepo;

    public ProgressUpdate createUpdate(Long userId, String content) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ProgressUpdate update = new ProgressUpdate();

        // FIX: Using .setContent() instead of .setUpdateText()
        update.setContent(content);

        update.setUser(user);

        return progressRepo.save(update);
    }

    public List<ProgressUpdate> getUserUpdates(Long userId) {
        // FIX: Using .findByUserIdOrderByCreatedAtDesc()
        return progressRepo.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public void deleteUpdate(Long id) {
        progressRepo.deleteById(id);
    }
}