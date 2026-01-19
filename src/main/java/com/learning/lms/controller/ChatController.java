package com.learning.lms.controller;

import com.learning.lms.dto.ChatConversationDto;
import com.learning.lms.entity.ChatMessage;
import com.learning.lms.repository.ChatMessageRepository;
import com.learning.lms.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final SimpMessagingTemplate messagingTemplate;
    private final ChatService chatService;
    private final ChatMessageRepository messageRepository;

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessage chatMessage) {
        ChatMessage saved = chatService.save(chatMessage);
        broadcastToBoth(saved);
    }

    @MessageMapping("/chat.edit")
    public void editMessage(@Payload Map<String, Object> payload) {
        Long messageId = Long.valueOf(payload.get("id").toString());
        String newContent = (String) payload.get("content");

        ChatMessage updated = chatService.editMessage(messageId, newContent);
        broadcastToBoth(updated);
    }

    @MessageMapping("/chat.delete")
    public void deleteMessage(@Payload Map<String, Object> payload) {
        Long messageId = Long.valueOf(payload.get("id").toString());
        ChatMessage deleted = chatService.deleteMessage(messageId);
        broadcastToBoth(deleted);
    }

    // WebSocket method for real-time updates
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Map<String, Long> payload) {
        Long senderId = payload.get("senderId");
        Long recipientId = payload.get("recipientId");

        chatService.markMessagesAsRead(senderId, recipientId);

        // Notify Sender: "Your message was read"
        messagingTemplate.convertAndSendToUser(
                String.valueOf(senderId),
                "/queue/read-receipt",
                recipientId
        );
    }

    // --- NEW: HTTP Endpoint to reliably mark messages as read ---
    @PutMapping("/messages/read/{senderId}/{recipientId}")
    public ResponseEntity<Void> markMessagesReadHttp(@PathVariable Long senderId, @PathVariable Long recipientId) {
        chatService.markMessagesAsRead(senderId, recipientId);
        return ResponseEntity.ok().build();
    }

    private void broadcastToBoth(ChatMessage message) {
        messagingTemplate.convertAndSendToUser(String.valueOf(message.getRecipientId()), "/queue/messages", message);
        messagingTemplate.convertAndSendToUser(String.valueOf(message.getSenderId()), "/queue/messages", message);
    }

    @GetMapping("/messages/{senderId}/{recipientId}")
    public ResponseEntity<List<ChatMessage>> findChatMessages(@PathVariable Long senderId, @PathVariable Long recipientId) {
        return ResponseEntity.ok(chatService.findChatMessages(senderId, recipientId));
    }

    @PostMapping("/chat/upload")
    public ResponseEntity<String> uploadChatImage(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = chatService.saveImage(file);
            String fullUrl = ServletUriComponentsBuilder.fromCurrentContextPath().path(fileUrl).toUriString();
            return ResponseEntity.ok(fullUrl);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Upload failed");
        }
    }

    @GetMapping("/messages/unread/count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long userId) {
        return ResponseEntity.ok(messageRepository.countByRecipientIdAndIsReadFalse(userId));
    }

    @GetMapping("/chat/conversations")
    public ResponseEntity<List<ChatConversationDto>> getConversations(@RequestParam Long userId) {
        return ResponseEntity.ok(chatService.getConversations(userId));
    }
}