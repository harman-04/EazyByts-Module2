package com.stocksim.stocktrading.repository;

import com.stocksim.stocktrading.model.ERole;
import com.stocksim.stocktrading.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**

 Spring Data JPA Repository for the Role entity.

 Provides methods for database interactions related to roles.
 */
@Repository // Marks this interface as a Spring Data JPA repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    // Custom query method to find a role by its name (ERole enum)
    Optional <Role> findByName(ERole name);
}
