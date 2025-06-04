package com.stocksim.stocktrading.security.jwt;

import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

/**
 * Utility class for JWT (JSON Web Token) operations.
 * Handles generation, parsing, and validation of JWTs.
 */
@Component // Marks this class as a Spring component
public class JwtUtils {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtils.class);

    // Inject JWT secret and expiration time from application.yml
    @Value("${spring.jwt.secret}")
    private String jwtSecret;

    @Value("${spring.jwt.expirationMs}")
    private int jwtExpirationMs;

    // Add a PostConstruct method to log the loaded secret (first few chars for security)
    // This helps confirm if the @Value injection is working as expected.
    // @PostConstruct
    // public void init() {
    //     if (jwtSecret != null && jwtSecret.length() > 10) {
    //         logger.info("JWT Secret loaded (first 10 chars): {}", jwtSecret.substring(0, 10));
    //     } else {
    //         logger.warn("JWT Secret is null or too short: {}", jwtSecret);
    //     }
    // }

    /**
     * Generates a JWT token for the authenticated user.
     * @param authentication The Spring Security Authentication object.
     * @return The generated JWT token string.
     */
    public String generateJwtToken(Authentication authentication) {
        // Get UserDetailsImpl from the authentication object
        UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

        // Build the JWT token
        String jwt = Jwts.builder()
                .setSubject((userPrincipal.getUsername())) // Set subject to username
                .setIssuedAt(new Date()) // Set token issuance date
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Set token expiration date
                .signWith(key(), SignatureAlgorithm.HS256) // Sign the token with HS256 algorithm and secret key
                .compact(); // Compacts the JWT into a URL-safe string

        logger.debug("Generated JWT for user {}: {}", userPrincipal.getUsername(), jwt);
        return jwt;
    }

    /**
     * Retrieves the signing key from the JWT secret.
     * @return The signing key.
     */
    private Key key() {
        // Decode the base64 encoded secret and create a Key object
        // This is where the Base64 decoding happens.
        try {
            return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
        } catch (IllegalArgumentException e) {
            logger.error("Error decoding JWT secret. Ensure it is a valid Base64 string: {}", e.getMessage());
            throw new RuntimeException("Invalid JWT secret configuration.", e);
        }
    }

    /**
     * Extracts the username from a JWT token.
     * @param token The JWT token string.
     * @return The username extracted from the token.
     */
    public String getUserNameFromJwtToken(String token) {
        // Parse the token and get the subject (username)
        return Jwts.parserBuilder().setSigningKey(key()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    /**
     * Validates a JWT token.
     * @param authToken The JWT token string.
     * @return True if the token is valid, false otherwise.
     */
    public boolean validateJwtToken(String authToken) {
        try {
            // Parse and validate the token using the signing key
            Jwts.parserBuilder().setSigningKey(key()).build().parse(authToken);
            logger.debug("JWT token is valid.");
            return true;
        } catch (MalformedJwtException e) {
            logger.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            logger.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT claims string is empty or invalid: {}", e.getMessage());
        } catch (io.jsonwebtoken.security.SignatureException e) { // Explicitly catch SignatureException
            logger.error("JWT signature does not match locally computed signature. Token tampered or wrong secret: {}", e.getMessage());
        } catch (Exception e) { // Catch any other unexpected exceptions
            logger.error("An unexpected error occurred during JWT validation: {}", e.getMessage(), e);
        }

        return false;
    }
}
