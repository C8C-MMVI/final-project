package com.system.technologs.repository;

import com.system.technologs.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    // Last 50 messages for a room, oldest first
    List<ChatMessage> findTop50ByRoomIdOrderBySentAtAsc(Long roomId);

    // Count unread messages sent by other party
    long countByRoomIdAndSenderIdNotAndIsReadFalse(Long roomId, Long senderId);
}