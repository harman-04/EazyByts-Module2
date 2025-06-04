package com.stocksim.stocktrading.model;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

/**
 * JPA Entity representing a chat message.
 */
@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String messageText;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "chat_room_id", length = 50) // For future multiple chat rooms, keep it simple for now
    private String chatRoomId;

    public ChatMessage(User sender, String messageText, String chatRoomId) {
        this.sender = sender;
        this.messageText = messageText;
        this.chatRoomId = chatRoomId;
        this.timestamp = LocalDateTime.now();
    }
}