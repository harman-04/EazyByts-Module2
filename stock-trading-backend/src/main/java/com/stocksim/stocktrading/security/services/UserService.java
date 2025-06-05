package com.stocksim.stocktrading.security.services;
import com.stocksim.stocktrading.dto.EmailUpdateRequest;
import com.stocksim.stocktrading.dto.PasswordChangeRequest;
import com.stocksim.stocktrading.exception.BadRequestException;
import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    /**
     * Updates the email address of a user.
     *
     * @param userId The ID of the user to update.
     * @param request The email update request containing new email and current password.
     * @return The updated User object.
     * @throws BadRequestException if the current password is incorrect or the new email is already taken.
     */
    @Transactional // Ensures atomicity: all or nothing
    public User updateEmail(Long userId, EmailUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found."));

        // Verify current password using getPasswordHash()
        if (!encoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Incorrect current password.");
        }

        // Check if new email is already in use by another user
        if (!user.getEmail().equalsIgnoreCase(request.getNewEmail()) && userRepository.existsByEmail(request.getNewEmail())) {
            throw new BadRequestException("Email is already taken!");
        }

        user.setEmail(request.getNewEmail());
        return userRepository.save(user);
    }

    /**
     * Changes the password of a user.
     *
     * @param userId The ID of the user to update.
     * @param request The password change request containing current, new, and confirm new passwords.
     * @return The updated User object.
     * @throws BadRequestException if current password is incorrect, new passwords do not match, or new password is same as old.
     */
    @Transactional
    public User changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found."));

        // Verify current password using getPasswordHash()
        if (!encoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Incorrect current password.");
        }

        // Check if new password and confirm new password match
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new BadRequestException("New password and confirm new password do not match.");
        }

        // Check if new password is different from old password (also using getPasswordHash())
        if (encoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("New password cannot be the same as the current password.");
        }

        user.setPasswordHash(encoder.encode(request.getNewPassword())); // Use setPasswordHash()
        return userRepository.save(user);
    }

    public Optional<User> findById(Long userId) {
        return userRepository.findById(userId);
    }
}