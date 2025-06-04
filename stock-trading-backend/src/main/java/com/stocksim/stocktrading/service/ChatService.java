package com.stocksim.stocktrading.service;
import com.stocksim.stocktrading.model.ChatMessage;
import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.repository.ChatMessageRepository;
import com.stocksim.stocktrading.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing chat messages.
 */
@Service
public class ChatService {
    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Saves a new chat message to the database.
     * @param senderUsername The username of the message sender.
     * @param messageText The content of the message.
     * @param chatRoomId The ID of the chat room.
     * @return The saved ChatMessage entity.
     */
    @Transactional
    public ChatMessage saveChatMessage(String senderUsername, String messageText, String chatRoomId) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new UsernameNotFoundException("Sender user not found: " + senderUsername));
        ChatMessage chatMessage = new ChatMessage(sender, messageText, chatRoomId);
        return chatMessageRepository.save(chatMessage);
    }

    /**
     * Retrieves recent chat messages for a specific chat room.
     * @param chatRoomId The ID of the chat room.
     * @return A list of recent ChatMessage entities.
     */
    @Transactional(readOnly = true)
    public List<ChatMessage> getRecentChatMessages(String chatRoomId) {
        return chatMessageRepository.findTop50ByChatRoomIdOrderByTimestampAsc(chatRoomId);
    }
}