package com.learning.lms.service;

import com.learning.lms.entity.ChatMessage;
import com.learning.lms.entity.User;
import com.learning.lms.repository.ChatMessageRepository;
import com.learning.lms.repository.UserRepository;
import net.coobird.thumbnailator.Thumbnails;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final String UPLOAD_DIR = "uploads/chat/";

    public ChatMessage save(ChatMessage message) {
        message.setChatId(getChatId(message.getSenderId(), message.getRecipientId()));
        message.setTimestamp(LocalDateTime.now());
        message.setStatus(ChatMessage.MessageStatus.DELIVERED);
        return messageRepository.save(message);
    }

    public List<ChatMessage> findChatMessages(Long senderId, Long recipientId) {
        String chatId = getChatId(senderId, recipientId);
        return messageRepository.findByChatId(chatId);
    }

    private String getChatId(Long senderId, Long recipientId) {
        return (senderId < recipientId) ? senderId + "_" + recipientId : recipientId + "_" + senderId;
    }

    // --- NEW: Compress & Save Image ---
    public String saveImage(MultipartFile file) throws IOException {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) directory.mkdirs();

        String fileName = UUID.randomUUID() + ".jpg"; // Force JPG for consistency
        File destination = new File(UPLOAD_DIR + fileName);

        // Compress image to reasonable quality (0.7 quality, max 1024px width)
        Thumbnails.of(file.getInputStream())
                .size(1024, 1024)
                .outputQuality(0.7)
                .toFile(destination);

        return "/uploads/chat/" + fileName; // Return relative URL
    }

    // --- NEW: Edit Message ---
    @Transactional
    public ChatMessage editMessage(Long messageId, String newContent) {
        ChatMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setContent(newContent);
        msg.setEdited(true);
        return messageRepository.save(msg);
    }

    // --- NEW: Delete Message ---
    @Transactional
    public ChatMessage deleteMessage(Long messageId) {
        ChatMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        msg.setDeleted(true);
        msg.setContent("This message was deleted");
        msg.setType(ChatMessage.MessageType.SYSTEM); // Change type so UI handles it differently
        return messageRepository.save(msg);
    }

    // --- NEW: Mark Messages as Read ---
    @Transactional
    public void markMessagesAsRead(Long senderId, Long recipientId) {
        String chatId = getChatId(senderId, recipientId);
        List<ChatMessage> unreadMessages = messageRepository.findByChatIdAndRecipientIdAndIsReadFalse(chatId, recipientId);

        if (!unreadMessages.isEmpty()) {
            unreadMessages.forEach(m -> {
                m.setRead(true);
                m.setReadAt(LocalDateTime.now());
                m.setStatus(ChatMessage.MessageStatus.READ);
            });
            messageRepository.saveAll(unreadMessages);
        }
    }
}