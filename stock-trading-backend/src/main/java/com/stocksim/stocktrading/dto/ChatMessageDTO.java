package com.stocksim.stocktrading.dto;
import com.stocksim.stocktrading.model.ChatMessage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * DTO for representing a chat message.
 */
@Getter
@Setter
@NoArgsConstructor // Lombok annotation for no-arg constructor
public class ChatMessageDTO {
    private Long id;
    private String senderUsername;
    private String messageText;
    private LocalDateTime timestamp;
    private String chatRoomId;

    public ChatMessageDTO(ChatMessage chatMessage) {
        this.id = chatMessage.getId();
        this.senderUsername = chatMessage.getSender() != null ? chatMessage.getSender().getUsername() : "Unknown"; // Handle if sender could be null
        this.messageText = chatMessage.getMessageText();
        this.timestamp = chatMessage.getTimestamp();
        this.chatRoomId = chatMessage.getChatRoomId();
    }
}