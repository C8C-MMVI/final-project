package com.system.technologs.dto;

import lombok.Data;

// ── Sent by client over STOMP to /app/chat.send ──────────────────────────────
@Data
public class ChatMessageRequest {
    private Long   roomId;
    private Long   senderId;
    private String senderName;
    private String senderRole;   // "customer" | "technician"
    private String message;
}