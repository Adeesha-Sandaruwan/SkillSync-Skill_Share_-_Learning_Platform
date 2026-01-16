package com.learning.lms.controller;

import com.learning.lms.entity.ChatMessage;
import com.learning.lms.dto.UserSummaryDto; // Reuse your DTO
import com.learning.lms.service.ChatService;
import com.learning.lms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final UserService userService;

    // WebSocket endpoint: /app/chat
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage saved = chatService.save(chatMessage);

        // Send to Recipient (Queue: /user/{recipientId}/queue/messages)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getRecipientId()),
                "/queue/messages",
                saved
        );

        // Send back to Sender (so their UI updates instantly with the saved timestamp)
        messagingTemplate.convertAndSendToUser(
                String.valueOf(chatMessage.getSenderId()),
                "/queue/messages",
                saved
        );
    }

    // REST endpoint to get history: /messages/{senderId}/{recipientId}
    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(@PathVariable Long senderId,
                                                              @PathVariable Long recipientId) {
        return ResponseEntity.ok(chatService.findChatMessages(senderId, recipientId));
    }
}