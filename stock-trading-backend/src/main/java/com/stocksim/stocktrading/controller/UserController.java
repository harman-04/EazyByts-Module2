package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.EmailUpdateRequest;
import com.stocksim.stocktrading.dto.MessageResponse;
import com.stocksim.stocktrading.dto.PasswordChangeRequest;
import com.stocksim.stocktrading.dto.UserDTO;
import com.stocksim.stocktrading.model.User;

import com.stocksim.stocktrading.repository.UserRepository;
import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import com.stocksim.stocktrading.security.services.UserService; // Import the new service
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*; // Changed to include PutMapping
import org.springframework.web.server.ResponseStatusException;

/**
 * REST Controller for managing user-related requests (e.g., fetching user profile).
 */
@RestController
@RequestMapping("/api/user") // Base path for user-related endpoints
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService; // Autowire the new UserService

    /**
     * Retrieves the profile details of the currently authenticated user.
     * Requires 'ROLE_USER' authority.
     *
     * @param authentication The authenticated user's details.
     * @return ResponseEntity with UserDTO on success, or 404 Not Found if user not in DB.
     */
    @GetMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDTO> getUserProfile(Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String username = userDetails.getUsername();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with username: " + username));

        return ResponseEntity.ok(new UserDTO(user));
    }

    /**
     * Updates the email address of the currently authenticated user.
     * Requires 'ROLE_USER' authority.
     *
     * @param authentication The authenticated user's details.
     * @param request The email update request DTO.
     * @return ResponseEntity with a success message.
     */
    @PutMapping("/profile/email") // Using PUT for updates
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> updateEmail(
            Authentication authentication,
            @Valid @RequestBody EmailUpdateRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId(); // Get user ID from UserDetailsImpl

        userService.updateEmail(userId, request);
        return ResponseEntity.ok(new MessageResponse("Email updated successfully!"));
    }

    /**
     * Changes the password of the currently authenticated user.
     * Requires 'ROLE_USER' authority.
     *
     * @param authentication The authenticated user's details.
     * @param request The password change request DTO.
     * @return ResponseEntity with a success message.
     */
    @PutMapping("/profile/password") // Using PUT for updates
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody PasswordChangeRequest request) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Long userId = userDetails.getId(); // Get user ID from UserDetailsImpl

        userService.changePassword(userId, request);
        return ResponseEntity.ok(new MessageResponse("Password changed successfully!"));
    }
}