package com.learning.lms.repository;

import com.learning.lms.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByChatId(String chatId);

    // Used for the Sidebar Badge count
    Long countByRecipientIdAndIsReadFalse(Long recipientId);

    // Used for marking messages as read in a specific chat
    List<ChatMessage> findByChatIdAndRecipientIdAndIsReadFalse(String chatId, Long recipientId);
}