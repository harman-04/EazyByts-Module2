package com.stocksim.stocktrading.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

/**

 DTO for user registration requests.

 Contains username, email, password, and optionally roles.
 */
@Getter
@Setter
public class SignupRequest {
    @NotBlank
    @Size(min = 3, max = 20)
    private String username;

    @NotBlank
    @Size(max = 50)
    @Email // Ensures the field is a valid email format
    private String email;

    @NotBlank
    @Size(min = 6, max = 40)
    private String password;

    // Optional: for assigning roles during signup.
// For this project, we'll default to ROLE_USER.
    private Set <String> role;
}
