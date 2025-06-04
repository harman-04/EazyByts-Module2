// UserDetailsServiceImpl.java
package com.stocksim.stocktrading.security.services;

import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 Custom implementation of Spring Security's UserDetailsService.
 This service is responsible for loading user-specific data during authentication.
 */
@Service // Marks this class as a Spring Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired // Injects UserRepository dependency
    UserRepository userRepository;

    /**
     Loads user details by username for authentication.
     @param username The username to load.
     @return UserDetails object containing user information.
     @throws UsernameNotFoundException if the user is not found.
     */
    @Override
    @Transactional // Ensures the entire method runs in a single transaction
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
// Find user by username, or throw exception if not found
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with username: " + username));

// Build and return UserDetailsImpl from the found User entity
        return UserDetailsImpl.build(user);
    }
}