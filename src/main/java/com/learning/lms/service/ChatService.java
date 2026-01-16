package com.learning.lms.service;

import com.learning.lms.entity.ChatMessage;
import com.learning.lms.entity.User;
import com.learning.lms.repository.ChatMessageRepository;
import com.learning.lms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

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

    // Creates a unique ID for the conversation regardless of who sends first: "minId_maxId"
    private String getChatId(Long senderId, Long recipientId) {
        if (senderId < recipientId) {
            return senderId + "_" + recipientId;
        } else {
            return recipientId + "_" + senderId;
        }
    }

    @Transactional
    public void disconnect(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setOnline(false);
            user.setLastSeen(LocalDateTime.now());
            userRepository.save(user);
        }
    }

    @Transactional
    public void connect(Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setOnline(true);
            userRepository.save(user);
        }
    }
}