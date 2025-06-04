// src/main/java/com/stocksim/stocktrading/dto/UserDTO.java
package com.stocksim.stocktrading.dto;

import com.stocksim.stocktrading.model.User;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * DTO for representing user profile information.
 * Excludes sensitive data like password hash.
 */
@Getter
@Setter
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
    private Set<String> roles; // List of role names

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.createdAt = user.getCreatedAt();
        this.roles = user.getRoles().stream()
                .map(role -> role.getName().name()) // Assuming RoleName is an Enum or similar
                .collect(Collectors.toSet());
    }
}