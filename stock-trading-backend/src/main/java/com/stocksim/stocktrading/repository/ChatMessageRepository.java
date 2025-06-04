package com.stocksim.stocktrading.repository;

import com.stocksim.stocktrading.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * Spring Data JPA Repository for the ChatMessage entity.
 */
@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Find recent messages for a specific chat room, ordered by timestamp
    List<ChatMessage> findTop50ByChatRoomIdOrderByTimestampAsc(String chatRoomId);

    // Find all messages for a specific chat room, ordered by timestamp
    List<ChatMessage> findByChatRoomIdOrderByTimestampAsc(String chatRoomId);
}