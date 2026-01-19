package com.learning.lms.service;

import com.learning.lms.dto.ChatConversationDto;
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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

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

    public List<ChatConversationDto> getConversations(Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId).orElseThrow();
        Set<User> conversationPartners = new HashSet<>(currentUser.getFollowing());

        return conversationPartners.stream().map(partner -> {
                    String chatId = getChatId(currentUserId, partner.getId());
                    List<ChatMessage> history = messageRepository.findByChatId(chatId);

                    String lastMsg = "Start a conversation";
                    LocalDateTime lastTime = null;
                    long unread = 0;

                    if (!history.isEmpty()) {
                        ChatMessage latest = history.get(history.size() - 1);
                        lastMsg = latest.getType() == ChatMessage.MessageType.IMAGE ? "📷 Photo" : latest.getContent();
                        if (latest.isDeleted()) lastMsg = "🚫 Message deleted";
                        lastTime = latest.getTimestamp();

                        unread = history.stream()
                                .filter(m -> m.getRecipientId().equals(currentUserId) && !m.isRead())
                                .count();
                    }

                    return ChatConversationDto.builder()
                            .userId(partner.getId())
                            .username(partner.getUsername())
                            .avatarUrl(partner.getAvatarUrl())
                            .isOnline(partner.isOnline())
                            .lastMessage(lastMsg)
                            .lastMessageTime(lastTime)
                            .unreadCount(unread)
                            .build();
                }).sorted(Comparator.comparing(ChatConversationDto::getLastMessageTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
    }

    private String getChatId(Long senderId, Long recipientId) {
        return (senderId < recipientId) ? senderId + "_" + recipientId : recipientId + "_" + senderId;
    }

    public String saveImage(MultipartFile file) throws IOException {
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) directory.mkdirs();
        String fileName = UUID.randomUUID() + ".jpg";
        File destination = new File(UPLOAD_DIR + fileName);
        Thumbnails.of(file.getInputStream()).size(1024, 1024).outputQuality(0.7).toFile(destination);
        return "/uploads/chat/" + fileName;
    }

    @Transactional
    public ChatMessage editMessage(Long messageId, String newContent) {
        ChatMessage msg = messageRepository.findById(messageId).orElseThrow();
        msg.setContent(newContent);
        msg.setEdited(true);
        return messageRepository.save(msg);
    }

    @Transactional
    public ChatMessage deleteMessage(Long messageId) {
        ChatMessage msg = messageRepository.findById(messageId).orElseThrow();
        msg.setDeleted(true);
        msg.setContent("");
        msg.setType(ChatMessage.MessageType.SYSTEM);
        return messageRepository.save(msg);
    }

    @Transactional
    public void markMessagesAsRead(Long senderId, Long recipientId) {
        String chatId = getChatId(senderId, recipientId);
        // Find messages sent BY the partner (senderId) TO me (recipientId) that are unread
        List<ChatMessage> unread = messageRepository.findByChatIdAndRecipientIdAndIsReadFalse(chatId, recipientId);
        if(!unread.isEmpty()){
            unread.forEach(m -> {
                m.setRead(true);
                m.setReadAt(LocalDateTime.now());
                m.setStatus(ChatMessage.MessageStatus.READ);
            });
            messageRepository.saveAll(unread);
        }
    }
}