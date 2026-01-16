package com.learning.lms.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
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

    @Enumerated(EnumType.STRING)
    private MessageType type;

    @Column(columnDefinition = "boolean default false")
    @JsonProperty("isRead") // Forces JSON to use "isRead"
    private boolean isRead;

    private LocalDateTime readAt;

    @Column(columnDefinition = "boolean default false")
    @JsonProperty("isEdited") // Forces JSON to use "isEdited"
    private boolean isEdited;

    @Column(columnDefinition = "boolean default false")
    @JsonProperty("isDeleted") // Forces JSON to use "isDeleted"
    private boolean isDeleted;

    public enum MessageStatus { DELIVERED, RECEIVED, READ }
    public enum MessageType { TEXT, IMAGE, SYSTEM }
}