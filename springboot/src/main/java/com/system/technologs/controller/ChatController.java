package com.system.technologs.controller;

import com.system.technologs.dto.ChatMessageRequest;
import com.system.technologs.model.ChatMessage;
import com.system.technologs.model.ChatRoom;
import com.system.technologs.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService            chatService;
    private final SimpMessagingTemplate  broker;

    // ─────────────────────────────────────────────────────────────────────────
    // REST endpoints (called once on chat open via fetch)
    // ─────────────────────────────────────────────────────────────────────────

    // POST /api/chat/room
    // Body: { repairId, customerId, technicianId }
    // Gets existing room or creates one, returns room + message history
    @PostMapping("/room")
    public ResponseEntity<?> getOrCreateRoom(@RequestBody Map<String, Long> body) {
        Long repairId     = body.get("repairId");
        Long customerId   = body.get("customerId");
        Long technicianId = body.get("technicianId");

        if (repairId == null || customerId == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "repairId and customerId are required."));
        }

        ChatRoom         room     = chatService.getOrCreateRoom(repairId, customerId, technicianId);
        List<ChatMessage> history = chatService.getHistory(room.getRoomId());

        return ResponseEntity.ok(Map.of(
            "room",     room,
            "messages", history
        ));
    }

    // GET /api/chat/history/{roomId}
    // Load last 50 messages for a room
    @GetMapping("/history/{roomId}")
    public ResponseEntity<List<ChatMessage>> getHistory(@PathVariable Long roomId) {
        return ResponseEntity.ok(chatService.getHistory(roomId));
    }

    // PATCH /api/chat/read
    // Body: { roomId, userId }
    // Mark all messages not from userId as read
    @PatchMapping("/read")
    public ResponseEntity<?> markRead(@RequestBody Map<String, Long> body) {
        chatService.markRead(body.get("roomId"), body.get("userId"));
        return ResponseEntity.ok(Map.of("success", true));
    }

    // GET /api/chat/unread?roomId=1&userId=5
    @GetMapping("/unread")
    public ResponseEntity<?> unreadCount(
            @RequestParam Long roomId,
            @RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("unread", chatService.unreadCount(roomId, userId)));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STOMP WebSocket handlers
    // ─────────────────────────────────────────────────────────────────────────

    // Client sends to: /app/chat.send
    // Server broadcasts to: /topic/chat.{roomId}
    @MessageMapping("/chat.send")
    public void handleMessage(@Payload ChatMessageRequest req) {
        if (req.getMessage() == null || req.getMessage().isBlank()) return;

        // Persist to MongoDB
        ChatMessage saved = chatService.saveMessage(req);

        // Broadcast to everyone subscribed to this room's topic
        broker.convertAndSend("/topic/chat." + req.getRoomId(), saved);
    }

    // Client sends to: /app/chat.typing
    // Server broadcasts typing indicator to room (not persisted)
    @MessageMapping("/chat.typing")
    public void handleTyping(@Payload Map<String, Object> payload) {
        Long   roomId = Long.valueOf(payload.get("roomId").toString());
        broker.convertAndSend("/topic/chat." + roomId, (Object) Map.of(
            "type",      "typing",
            "senderId",  payload.get("senderId"),
            "senderName",payload.get("senderName"),
            "isTyping",  payload.get("isTyping")
        ));
    }

    // Client sends to: /app/chat.read
    // Server broadcasts read receipt to room
    @MessageMapping("/chat.read")
    public void handleRead(@Payload Map<String, Object> payload) {
        Long roomId = Long.valueOf(payload.get("roomId").toString());
        Long userId = Long.valueOf(payload.get("userId").toString());

        chatService.markRead(roomId, userId);

        broker.convertAndSend("/topic/chat." + roomId, (Object) Map.of(
            "type",   "read_receipt",
            "userId", userId
        ));
    }
}