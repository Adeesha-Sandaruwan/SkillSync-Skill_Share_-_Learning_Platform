package com.learning.lms.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ChatConversationDto {
    private Long userId;
    private String username;
    private String avatarUrl;
    private boolean isOnline;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private Long unreadCount;
}