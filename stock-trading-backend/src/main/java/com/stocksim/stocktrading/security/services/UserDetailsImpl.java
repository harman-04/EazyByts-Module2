package com.stocksim.stocktrading.security.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.model.Role; // Import Role model
import org.slf4j.Logger; // Import Logger
import org.slf4j.LoggerFactory; // Import LoggerFactory
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Custom implementation of Spring Security's UserDetails interface.
 * This class wraps our User entity to provide the necessary user details
 * for authentication and authorization processes.
 */
public class UserDetailsImpl implements UserDetails {

    private static final long serialVersionUID = 1L;
    private static final Logger logger = LoggerFactory.getLogger(UserDetailsImpl.class); // Add logger

    private Long id;
    private String username;
    private String email;

    @JsonIgnore // Prevents password from being serialized into JSON response
    private String password;

    private Collection<? extends GrantedAuthority> authorities;

    /**
     * Constructor for UserDetailsImpl.
     * @param id The user's ID.
     * @param username The user's username.
     * @param email The user's email.
     * @param password The user's hashed password.
     * @param authorities A collection of granted authorities (roles) for the user.
     */
    public UserDetailsImpl(Long id, String username, String email, String password,
                           Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.authorities = authorities;
    }

    /**
     * Builds a UserDetailsImpl object from a User entity.
     * Maps user roles to Spring Security's GrantedAuthority.
     * @param user The User entity from the database.
     * @return A UserDetailsImpl instance.
     */
    public static UserDetailsImpl build(User user) {
        List<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> {
                    String roleName = role.getName().name(); // Get the string representation of the ERole
                    logger.debug("Mapping role: {} to GrantedAuthority: {}", role.getName(), roleName); // Log the role mapping
                    return new SimpleGrantedAuthority(roleName);
                })
                .collect(Collectors.toList());

        logger.debug("Built UserDetailsImpl for user {}. Authorities: {}", user.getUsername(), authorities); // Log final authorities

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPasswordHash(), // Use passwordHash from User entity
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Account is always non-expired
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Account is always non-locked
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Credentials are always non-expired
    }

    @Override
    public boolean isEnabled() {
        return true; // Account is always enabled
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        UserDetailsImpl user = (UserDetailsImpl) o;
        return Objects.equals(id, user.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}