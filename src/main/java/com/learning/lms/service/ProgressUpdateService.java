package com.learning.lms.service;

import com.learning.lms.dto.ProgressUpdateRequest;
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

    private final ProgressUpdateRepository updateRepository;
    private final UserRepository userRepository;

    public ProgressUpdate addUpdate(Long userId, ProgressUpdateRequest request) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));

        ProgressUpdate update = new ProgressUpdate();
        update.setUpdateText(request.getUpdateText());
        update.setStatus(request.getStatus());
        update.setUser(user);

        return updateRepository.save(update);
    }

    public List<ProgressUpdate> getUserUpdates(Long userId) {
        return updateRepository.findByUserIdOrderByPostedAtDesc(userId);
    }

    public void deleteUpdate(Long updateId) {
        updateRepository.deleteById(updateId);
    }
}