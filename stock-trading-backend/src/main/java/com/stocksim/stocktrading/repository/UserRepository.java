package com.stocksim.stocktrading.repository;

import com.stocksim.stocktrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**

 Spring Data JPA Repository for the User entity.

 Provides methods for database interactions related to users.
 */
@Repository // Marks this interface as a Spring Data JPA repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Custom query method to find a user by username
    Optional <User> findByUsername(String username);

    // Custom query method to check if a user exists by username
    Boolean existsByUsername(String username);

    // Custom query method to check if a user exists by email
    Boolean existsByEmail(String email);
}