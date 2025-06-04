package com.stocksim.stocktrading.config.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.beans.factory.annotation.Autowired; // Add this import
import org.springframework.messaging.simp.config.ChannelRegistration; // Add this import

/**
 * WebSocket configuration for STOMP messaging.
 * Enables a message broker to send messages to clients.
 */
@Configuration // Marks this class as a Spring configuration class
@EnableWebSocketMessageBroker // Enables WebSocket message handling, backed by a message broker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Autowired // Autowire your interceptor
    private JwtChannelInterceptor jwtChannelInterceptor;

    /**
     * Registers STOMP endpoints that clients will use to connect to our WebSocket server.
     *
     * @param registry The registry for STOMP endpoints.
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:5173")
                .withSockJS();
    }

    /**
     * Configures the message broker.
     *
     * @param registry The registry for configuring message brokers.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    /**
     * Configure the client inbound channel.
     * This is where you register your interceptors.
     * @param registration The registration for the client inbound channel.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(jwtChannelInterceptor); // Register your interceptor here
    }
}