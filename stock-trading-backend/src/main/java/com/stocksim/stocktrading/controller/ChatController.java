package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.ChatMessageDTO;
import com.stocksim.stocktrading.model.ChatMessage;
import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import com.stocksim.stocktrading.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping; // For WebSocket messages
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor; // For accessing WebSocket session attributes
import org.springframework.messaging.simp.SimpMessagingTemplate; // For sending WebSocket messages
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing chat history and WebSocket message handling.
 */
//@CrossOrigin(origins = "*", maxAge = 3600) // Adjust origins as needed
// ... (imports remain the same)

@RestController
@RequestMapping("/api/chat")
public class ChatController {
    @Autowired
    private ChatService chatService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping("/history/{chatRoomId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<ChatMessageDTO>> getChatHistory(@PathVariable String chatRoomId) {
        List<ChatMessage> messages = chatService.getRecentChatMessages(chatRoomId);
        List<ChatMessageDTO> messageDTOs = messages.stream()
                .map(ChatMessageDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(messageDTOs);
    }

    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDTO chatMessageDTO,
                            SimpMessageHeaderAccessor headerAccessor) { // Removed Authentication authentication
        Authentication sessionAuthentication = (Authentication) headerAccessor.getUser();

        if (sessionAuthentication == null || sessionAuthentication.getPrincipal() == null) {
            System.err.println("Authentication object is null or principal is null for sendMessage. Message not processed.");
            // Depending on your security requirements, you might throw an exception
            // or send an error message back to the client here.
            return;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) sessionAuthentication.getPrincipal();
        String senderUsername = userDetails.getUsername();

        chatMessageDTO.setSenderUsername(senderUsername);
        chatMessageDTO.setTimestamp(LocalDateTime.now());

        ChatMessage savedMessage = chatService.saveChatMessage(
                senderUsername,
                chatMessageDTO.getMessageText(),
                chatMessageDTO.getChatRoomId() != null ? chatMessageDTO.getChatRoomId() : "public"
        );

        chatMessageDTO.setId(savedMessage.getId());
        chatMessageDTO.setTimestamp(savedMessage.getTimestamp());

        messagingTemplate.convertAndSend("/topic/publicChat", chatMessageDTO);
    }

    @MessageMapping("/chat.addUser")
    public void addUser(@Payload ChatMessageDTO chatMessageDTO,
                        SimpMessageHeaderAccessor headerAccessor) { // Removed Authentication authentication
        Authentication sessionAuthentication = (Authentication) headerAccessor.getUser();

        if (sessionAuthentication == null || sessionAuthentication.getPrincipal() == null) {
            System.err.println("Authentication object is null or principal is null for addUser. Join message not processed.");
            // Handle as per your application's security policy
            return;
        }

        UserDetailsImpl userDetails = (UserDetailsImpl) sessionAuthentication.getPrincipal();
        String senderUsername = userDetails.getUsername();

        headerAccessor.getSessionAttributes().put("username", senderUsername);

        ChatMessageDTO joinMessage = new ChatMessageDTO();
        joinMessage.setSenderUsername("System");
        joinMessage.setMessageText(senderUsername + " joined the chat!");
        joinMessage.setTimestamp(LocalDateTime.now());
        joinMessage.setChatRoomId(chatMessageDTO.getChatRoomId() != null ? chatMessageDTO.getChatRoomId() : "public");

        chatService.saveChatMessage(
                "System",
                joinMessage.getMessageText(),
                joinMessage.getChatRoomId()
        );

        messagingTemplate.convertAndSend("/topic/publicChat", joinMessage);
    }
}