package com.learning.lms.config;

import com.learning.lms.entity.User;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.time.LocalDateTime;
import java.security.Principal;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserRepository userRepository;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        Principal user = event.getUser();
        if (user != null) {
            updateUserStatus(user.getName(), true);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal user = headerAccessor.getUser();
        if (user != null) {
            updateUserStatus(user.getName(), false);
        }
    }

    private void updateUserStatus(String username, boolean isOnline) {
        // Username in Principal is likely the email or username field depending on your UserDetails
        // Assuming it maps to our User entity's username or ID.
        // If your Principal.getName() returns the ID (as string), parse it.
        try {
            // Note: If you use JWT, usually the 'subject' is the ID or Username.
            // Adjust findBy... accordingly. Here assuming ID for safety.
            Long userId = Long.parseLong(username);
            userRepository.findById(userId).ifPresent(u -> {
                u.setOnline(isOnline);
                if (!isOnline) {
                    u.setLastSeen(LocalDateTime.now());
                }
                userRepository.save(u);
            });
        } catch (NumberFormatException e) {
            log.error("Could not parse user ID from principal: " + username);
        }
    }
}