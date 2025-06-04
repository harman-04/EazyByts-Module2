package com.stocksim.stocktrading.config.websocket;

import com.stocksim.stocktrading.security.jwt.JwtUtils;
import com.stocksim.stocktrading.security.services.UserDetailsServiceImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Channel Interceptor to handle JWT authentication for WebSocket STOMP connections.
 * This interceptor extracts the JWT from the STOMP CONNECT frame's headers,
 * validates it, and sets the authenticated user in the SecurityContextHolder
 * for the duration of the WebSocket session.
 */
@Component
public class JwtChannelInterceptor implements ChannelInterceptor {

    private static final Logger logger = LoggerFactory.getLogger(JwtChannelInterceptor.class);

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UserDetailsServiceImpl userDetailsService;

    /**
     * Intercepts messages before they are sent to the channel.
     * This is where we handle the authentication for STOMP CONNECT messages.
     *
     * @param message The message to be sent.
     * @param channel The message channel.
     * @return The message, potentially modified.
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        // Check if it's a STOMP CONNECT command
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            List<String> authorization = accessor.getNativeHeader("Authorization");
            String jwt = null;

            if (authorization != null && !authorization.isEmpty()) {
                String bearerToken = authorization.get(0);
                if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
                    jwt = bearerToken.substring(7); // Extract the JWT token
                }
            }

            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUserNameFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // Create an authenticated token and set it in the SecurityContextHolder
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null, // Credentials are null for token-based auth
                                userDetails.getAuthorities());

                // Set the authentication in the accessor's user header
                // This is crucial for Spring Security to recognize the user in the WebSocket session
                accessor.setUser(authentication);
                logger.debug("STOMP CONNECT: Successfully authenticated user {} for WebSocket session.", username);
            } else {
                logger.warn("STOMP CONNECT: No valid JWT token found or token validation failed.");
                // Optionally, you can reject the connection here if authentication is mandatory
                // accessor.setLeaveMutable(true);
                // accessor.setNativeHeader("message", "Authentication required");
                // accessor.setCommand(StompCommand.ERROR);
            }
        } else if (accessor.getCommand() == null) {
            // This case handles messages that are not STOMP commands, like heartbeats
            // or other internal messages. We don't need to process them for auth.
            logger.trace("Non-STOMP command message received.");
        } else {
            // For other STOMP commands (SEND, SUBSCRIBE, UNSUBSCRIBE, DISCONNECT),
            // ensure the security context is propagated from the CONNECT frame.
            // Spring usually handles this automatically if accessor.setUser was set on CONNECT.
            logger.debug("STOMP Command: {}. User: {}", accessor.getCommand(), accessor.getUser() != null ? accessor.getUser().getName() : "anonymous");
        }
        return message;
    }
}
