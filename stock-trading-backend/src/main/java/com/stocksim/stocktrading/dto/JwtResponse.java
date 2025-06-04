package com.stocksim.stocktrading.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**

 DTO for JWT authentication responses after successful login.

 Contains the JWT token, user ID, username, email, and user roles.
 */
@Getter
@Setter
public class JwtResponse {
    private String token;
    private String type = "Bearer"; // Standard token type
    private Long id;
    private String username;
    private String email;
    private List roles;

    /**

     Constructor for JwtResponse.

     @param accessToken The generated JWT token.

     @param id The user's ID.

     @param username The user's username.

     @param email The user's email.

     @param roles A list of string representations of the user's roles.
     */
    public JwtResponse(String accessToken, Long id, String username, String email, List roles) {
        this.token = accessToken;
        this.id = id;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
}