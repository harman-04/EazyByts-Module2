package com.stocksim.stocktrading.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for updating user email.
 */
public class EmailUpdateRequest {

    @NotBlank(message = "New email cannot be empty")
    @Size(max = 50, message = "Email length must be less than 50 characters")
    @Email(message = "Invalid email format")
    private String newEmail;

    @NotBlank(message = "Current password cannot be empty")
    private String currentPassword;

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getCurrentPassword() {
        return currentPassword;
    }

    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
}