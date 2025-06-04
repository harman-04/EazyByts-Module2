package com.stocksim.stocktrading.security.jwt;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

/**
 Handles unauthorized access attempts.
 If an unauthenticated user tries to access a protected resource,
 this entry point will be triggered, sending a 401 Unauthorized error.
 */
@Component // Marks this class as a Spring component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {

    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);

    /**
     Commences an authentication scheme.
     @param request The HTTP request.
     @param response The HTTP response.
     @param authException The authentication exception that occurred.
     @throws IOException if an I/O error occurs.
     @throws ServletException if a servlet-specific error occurs.
     */
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        logger.error("Unauthorized error: {}", authException.getMessage());
// Send a 401 Unauthorized status code to the client
        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Error: Unauthorized");
    }
}