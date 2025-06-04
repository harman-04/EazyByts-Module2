// src/main/java/com/stocksim/stocktrading/controller/UserController.java
package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.UserDTO;
import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.repository.UserRepository;
import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * REST Controller for managing user-related requests (e.g., fetching user profile).
 */
@CrossOrigin(origins = "*", maxAge = 3600) // Consider restricting origins in a production environment
@RestController
@RequestMapping("/api/user") // Base path for user-related endpoints
public class UserController {

    @Autowired
    private UserRepository userRepository;

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

    // You could add endpoints here for updating user details, changing password etc.
}