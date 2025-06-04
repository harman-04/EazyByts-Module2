package com.stocksim.stocktrading.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**

 DTO for user login requests.

 Contains username and password.
 */
@Getter
@Setter
public class LoginRequest {
    @NotBlank // Ensures the field is not null and not just whitespace
    private String username;

    @NotBlank // Ensures the field is not null and not just whitespace
    private String password;

}
