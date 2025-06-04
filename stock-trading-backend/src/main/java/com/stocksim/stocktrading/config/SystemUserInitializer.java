package com.stocksim.stocktrading.config;

// You might put this in a new file, e.g., src/main/java/com/stocksim/stocktrading/config/SystemUserInitializer.java

import com.stocksim.stocktrading.model.Role;
import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.repository.RoleRepository;
import com.stocksim.stocktrading.repository.UserRepository;
import com.stocksim.stocktrading.model.ERole; // Assuming you have an ERole enum
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Configuration
public class SystemUserInitializer {

    @Bean
    public CommandLineRunner createSystemUser(UserRepository userRepository, RoleRepository roleRepository, PasswordEncoder encoder) {
        return args -> {
            final String SYSTEM_USERNAME = "System";

            Optional<User> systemUserOpt = userRepository.findByUsername(SYSTEM_USERNAME);

            if (systemUserOpt.isEmpty()) {
                System.out.println("Creating System user...");
                User systemUser = new User();
                systemUser.setUsername(SYSTEM_USERNAME);
                systemUser.setEmail("system@stocksim.com"); // Use a placeholder email
                systemUser.setPasswordHash(encoder.encode("aVerySecureSystemPasswordThatIsNotUsedAnywhereElse!")); // Strong password

                // Assign a role, e.g., ROLE_USER or a special ROLE_SYSTEM if you have one
                Set<Role> roles = new HashSet<>();
                Optional<Role> userRole = roleRepository.findByName(ERole.ROLE_USER); // Adjust if you have ERole.ROLE_SYSTEM
                userRole.ifPresent(roles::add);
                // Handle case where ROLE_USER might not exist yet, though it should be handled by your setup
                if (userRole.isEmpty()) {
                    System.err.println("Warning: ROLE_USER not found. System user might be created without a role.");
                    // Consider throwing an error or creating the role if it's critical
                }

                systemUser.setRoles(roles);
                systemUser.setCreatedAt(LocalDateTime.now());

                userRepository.save(systemUser);
                System.out.println("System user created successfully.");
            } else {
                System.out.println("System user already exists.");
            }
        };
    }
}