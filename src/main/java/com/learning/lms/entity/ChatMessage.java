package com.learning.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String chatId;
    private Long senderId;
    private Long recipientId;

    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private MessageStatus status;

    // --- NEW FIELDS ---
    @Enumerated(EnumType.STRING)
    private MessageType type; // TEXT, IMAGE

    @Column(columnDefinition = "boolean default false")
    private boolean isRead;

    public enum MessageStatus { DELIVERED, RECEIVED }
    public enum MessageType { TEXT, IMAGE }
}