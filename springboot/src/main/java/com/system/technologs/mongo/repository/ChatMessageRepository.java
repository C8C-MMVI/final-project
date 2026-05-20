package com.system.technologs.mongo.repository;

import com.system.technologs.model.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessage, String> {

    List<ChatMessage> findTop50ByRoomIdOrderBySentAtAsc(Long roomId);

    long countByRoomIdAndSenderIdNotAndIsReadFalse(Long roomId, Long senderId);
}
