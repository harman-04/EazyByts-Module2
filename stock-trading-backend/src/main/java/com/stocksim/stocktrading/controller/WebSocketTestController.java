package com.stocksim.stocktrading.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketTestController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketTestController.class);

    /**
     * Receives a message from the client at /app/test and logs it.
     * This is a simple endpoint to confirm bidirectional WebSocket communication.
     * It does not send a response back to the client.
     */
    @MessageMapping("/test") // Maps to /app/test (Spring adds /app prefix by default)
    public void handleTestMessage(String message) {
        logger.info("Received test message from WebSocket: {}", message);
        // You could optionally send a response back to the client using @SendTo
        // For example: @SendTo("/topic/test-responses")
        // return "Server received: " + message;
    }
}
