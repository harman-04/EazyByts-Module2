// User.java
package com.stocksim.stocktrading.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * JPA Entity representing a user in the system.
 * Includes user details, associated roles, and a link to their portfolio.
 */
@Entity
@Table(name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "username"), // Ensure username is unique
                @UniqueConstraint(columnNames = "email")     // Ensure email is unique
        })
@Getter
@Setter
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing primary key
    private Long id;

    @Column(nullable = false, length = 50)
    private String username;

    @Column(nullable = false, length = 120)
    private String email;

    @Column(nullable = false)
    private String passwordHash; // Stores the hashed password

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Timestamp of user registration

    // Many-to-Many relationship with roles.
// 'fetch = FetchType.LAZY' means roles are loaded only when explicitly accessed.
// 'cascade = CascadeType.ALL' means operations like persist, merge, remove will cascade to roles.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "user_roles", // Junction table for Many-to-Many relationship
            joinColumns = @JoinColumn(name = "user_id"), // Foreign key for User
            inverseJoinColumns = @JoinColumn(name = "role_id")) // Foreign key for Role
    private Set<Role> roles = new HashSet<>(); // Add the generic type <Role>
    // One-to-One relationship with Portfolio.
// 'mappedBy = "user"' indicates that the 'user' field in the Portfolio entity is the owner of the relationship.
// 'cascade = CascadeType.ALL' ensures that if a user is deleted, their portfolio is also deleted.
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY, optional = false)
    private Portfolio portfolio;

    /**
     * Constructor for creating a User object.
     *
     * @param username     The user's chosen username.
     * @param email        The user's email address.
     * @param passwordHash The hashed password.
     */
    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = LocalDateTime.now(); // Set creation timestamp automatically
    }

    // Helper method to set the portfolio and establish bidirectional link
    public void setPortfolio(Portfolio portfolio) {
        this.portfolio = portfolio;
        if (portfolio != null) {
            portfolio.setUser(this);
        }
    }
}