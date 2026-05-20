package com.system.technologs.service;

import com.system.technologs.dto.ChatMessageRequest;
import com.system.technologs.model.ChatMessage;
import com.system.technologs.model.ChatRoom;
import com.system.technologs.mongo.repository.ChatMessageRepository;
import com.system.technologs.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository    roomRepo;
    private final ChatMessageRepository messageRepo;
    private final MongoTemplate         mongoTemplate;
    private final RestTemplate          restTemplate;

    @Value("${app.php.base-url:http://php:8000}")
    private String phpBaseUrl;

    @Value("${app.service-key:}")
    private String serviceKey;

    // ── Get or create room — race-condition safe ──────────────────────────────
    @Transactional
    public ChatRoom getOrCreateRoom(Long repairId, Long customerId, Long technicianId) {
        return roomRepo.findByRepairId(repairId)
                .orElseGet(() -> {
                    try {
                        return roomRepo.save(
                            ChatRoom.builder()
                                .repairId(repairId)
                                .customerId(customerId)
                                .technicianId(technicianId)
                                .build()
                        );
                    } catch (DataIntegrityViolationException e) {
                        // Race condition: another request already created the room
                        log.warn("Race condition on chat room creation for repair #{}, fetching existing.", repairId);
                        return roomRepo.findByRepairId(repairId)
                                .orElseThrow(() -> new RuntimeException(
                                        "Failed to get or create chat room for repair #" + repairId));
                    }
                });
    }

    // ── Get room by repairId ──────────────────────────────────────────────────
    public ChatRoom getRoomByRepairId(Long repairId) {
        return roomRepo.findByRepairId(repairId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Chat room not found for repair #" + repairId));
    }

    // ── Persist message and notify the other party ────────────────────────────
    public ChatMessage saveMessage(ChatMessageRequest req) {
        ChatMessage msg = ChatMessage.builder()
                .roomId(req.getRoomId())
                .senderId(req.getSenderId())
                .senderName(req.getSenderName())
                .senderRole(req.getSenderRole())
                .message(req.getMessage().trim())
                .build();

        ChatMessage saved = messageRepo.save(msg);

        try {
            sendChatNotification(req);
        } catch (Exception e) {
            log.warn("Failed to send chat notification for room {}: {}", req.getRoomId(), e.getMessage());
        }

        return saved;
    }

    // ── Build and POST notification to PHP API ────────────────────────────────
    private void sendChatNotification(ChatMessageRequest req) {
        roomRepo.findById(req.getRoomId()).ifPresent(room -> {
            Long targetUserId = resolveRecipient(req.getSenderId(), room);
            if (targetUserId == null) {
                log.debug("No recipient found for chat notification (room {}, sender {})",
                        req.getRoomId(), req.getSenderId());
                return;
            }

            String senderLabel = buildSenderLabel(req.getSenderRole(), req.getSenderName());
            String preview     = truncate(req.getMessage(), 60);
            String message     = senderLabel + ": " + preview;

            postNotification(targetUserId, message);
        });
    }

    private Long resolveRecipient(Long senderId, ChatRoom room) {
        if (senderId.equals(room.getCustomerId())) {
            return room.getTechnicianId();
        } else {
            return room.getCustomerId();
        }
    }

    private void postNotification(Long targetUserId, String message) {
        String url = phpBaseUrl + "/api/notifications.php";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = Map.of(
            "target_user_id", targetUserId,
            "message",        message,
            "_service_key",   serviceKey
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(url, request, Map.class);
            log.debug("Chat notification sent to user {}: {}", targetUserId, message);
        } catch (Exception e) {
            log.warn("Notification POST failed for user {}: {}", targetUserId, e.getMessage());
        }
    }

    // ── Load message history — MongoDB-failure safe ───────────────────────────
    public List<ChatMessage> getHistory(Long roomId) {
        try {
            return messageRepo.findTop50ByRoomIdOrderBySentAtAsc(roomId);
        } catch (Exception e) {
            log.warn("Could not load chat history for room {}: {}", roomId, e.getMessage());
            return List.of();
        }
    }

    // ── Mark all messages from other party as read ────────────────────────────
    public void markRead(Long roomId, Long readByUserId) {
        try {
            Query  query  = Query.query(
                Criteria.where("roomId").is(roomId)
                        .and("senderId").ne(readByUserId)
                        .and("isRead").is(false)
            );
            Update update = Update.update("isRead", true);
            mongoTemplate.updateMulti(query, update, ChatMessage.class);
        } catch (Exception e) {
            log.warn("Could not mark messages as read for room {}: {}", roomId, e.getMessage());
        }
    }

    // ── Unread count ──────────────────────────────────────────────────────────
    public long unreadCount(Long roomId, Long userId) {
        try {
            return messageRepo.countByRoomIdAndSenderIdNotAndIsReadFalse(roomId, userId);
        } catch (Exception e) {
            log.warn("Could not get unread count for room {}: {}", roomId, e.getMessage());
            return 0L;
        }
    }

    // ── All rooms for a customer ──────────────────────────────────────────────
    public List<ChatRoom> getRoomsForCustomer(Long customerId) {
        return roomRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    // ── All rooms for a technician ────────────────────────────────────────────
    public List<ChatRoom> getRoomsForTechnician(Long technicianId) {
        return roomRepo.findByTechnicianIdOrderByCreatedAtDesc(technicianId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private String buildSenderLabel(String role, String name) {
        if ("customer".equalsIgnoreCase(role))   return "💬 Customer " + name;
        if ("technician".equalsIgnoreCase(role)) return "🔧 Technician " + name;
        return "💬 " + name;
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() <= maxLen ? text : text.substring(0, maxLen) + "…";
    }

    private String getServiceKey() {
        return serviceKey;
    }
}