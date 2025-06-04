package com.stocksim.stocktrading.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

/**

 Generic DTO for simple message responses (e.g., success/error messages).
 */
@Getter
@Setter
@AllArgsConstructor // Lombok annotation to generate a constructor with all fields
public class MessageResponse {
    private String message;
}
