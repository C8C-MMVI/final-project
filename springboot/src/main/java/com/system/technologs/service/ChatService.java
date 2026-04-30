package com.system.technologs.service;

import com.system.technologs.dto.ChatMessageRequest;
import com.system.technologs.model.ChatMessage;
import com.system.technologs.model.ChatRoom;
import com.system.technologs.repository.ChatMessageRepository;
import com.system.technologs.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository    roomRepo;
    private final ChatMessageRepository messageRepo;
    private final MongoTemplate         mongoTemplate;

    // ── Get or create room for a repair ──────────────────────────────────────
    @Transactional
    public ChatRoom getOrCreateRoom(Long repairId, Long customerId, Long technicianId) {
        return roomRepo.findByRepairId(repairId)
                .orElseGet(() -> roomRepo.save(
                    ChatRoom.builder()
                        .repairId(repairId)
                        .customerId(customerId)
                        .technicianId(technicianId)
                        .build()
                ));
    }

    // ── Get room by repairId ──────────────────────────────────────────────────
    public ChatRoom getRoomByRepairId(Long repairId) {
        return roomRepo.findByRepairId(repairId)
                .orElseThrow(() -> new IllegalArgumentException("Chat room not found for repair #" + repairId));
    }

    // ── Persist and return a new message ─────────────────────────────────────
    public ChatMessage saveMessage(ChatMessageRequest req) {
        ChatMessage msg = ChatMessage.builder()
                .roomId(req.getRoomId())
                .senderId(req.getSenderId())
                .senderName(req.getSenderName())
                .senderRole(req.getSenderRole())
                .message(req.getMessage().trim())
                .build();
        return messageRepo.save(msg);
    }

    // ── Load message history for a room (last 50) ─────────────────────────────
    public List<ChatMessage> getHistory(Long roomId) {
        return messageRepo.findTop50ByRoomIdOrderBySentAtAsc(roomId);
    }

    // ── Mark all messages from other party as read ───────────────────────────
    public void markRead(Long roomId, Long readByUserId) {
        Query  query  = Query.query(
            Criteria.where("roomId").is(roomId)
                    .and("senderId").ne(readByUserId)
                    .and("isRead").is(false)
        );
        Update update = Update.update("isRead", true);
        mongoTemplate.updateMulti(query, update, ChatMessage.class);
    }

    // ── Unread count for a user in a room ────────────────────────────────────
    public long unreadCount(Long roomId, Long userId) {
        return messageRepo.countByRoomIdAndSenderIdNotAndIsReadFalse(roomId, userId);
    }

    // ── All rooms for a customer ──────────────────────────────────────────────
    public List<ChatRoom> getRoomsForCustomer(Long customerId) {
        return roomRepo.findByCustomerIdOrderByCreatedAtDesc(customerId);
    }

    // ── All rooms for a technician ────────────────────────────────────────────
    public List<ChatRoom> getRoomsForTechnician(Long technicianId) {
        return roomRepo.findByTechnicianIdOrderByCreatedAtDesc(technicianId);
    }
}