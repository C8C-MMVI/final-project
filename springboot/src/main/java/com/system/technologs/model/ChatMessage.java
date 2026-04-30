package com.system.technologs.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private String id;

    @Indexed
    private Long roomId;

    private Long senderId;
    private String senderName;
    private String senderRole;   // "customer" | "technician"

    private String message;

    @Builder.Default
    private boolean isRead = false;

    @Builder.Default
    private Instant sentAt = Instant.now();
}