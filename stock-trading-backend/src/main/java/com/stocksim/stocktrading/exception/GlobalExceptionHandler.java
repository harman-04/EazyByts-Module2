// src/main/java/com/stocksim/stocktrading/exception/GlobalExceptionHandler.java
package com.stocksim.stocktrading.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException; // Import AccessDeniedException
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

/**
 * Global exception handler for the application.
 * This class catches unhandled exceptions across all controllers and provides
 * a centralized way to log them and return appropriate HTTP responses.
 */
@ControllerAdvice // Marks this class as a global exception handler
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles AccessDeniedException, which occurs when an authenticated user
     * tries to access a resource they don't have permission for (e.g., @PreAuthorize fails).
     *
     * @param ex The AccessDeniedException that was thrown.
     * @param request The current web request.
     * @return A ResponseEntity with HTTP 403 Forbidden status and an error message.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        logger.error("Access Denied: {} - Request URI: {}", ex.getMessage(), request.getDescription(false), ex);
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Access Denied: You do not have permission to access this resource.");
    }

    /**
     * Catches all other unhandled exceptions.
     * This is a fallback handler for any exception not specifically caught by other handlers.
     * It logs the full stack trace and returns a generic 500 Internal Server Error.
     *
     * @param ex The Exception that was thrown.
     * @param request The current web request.
     * @return A ResponseEntity with HTTP 500 Internal Server Error status and a generic message.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleAllUnhandledExceptions(Exception ex, WebRequest request) {
        // Log the full stack trace of the exception
        logger.error("An unhandled exception occurred: {} - Request URI: {}", ex.getMessage(), request.getDescription(false), ex);
        // Also print to standard error for immediate visibility during development
        System.err.println("--- GLOBAL EXCEPTION HANDLER: Full Stack Trace ---");
        ex.printStackTrace(System.err);
        System.err.println("--- End of Global Stack Trace ---");

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("An unexpected error occurred. Please try again later.");
    }
}