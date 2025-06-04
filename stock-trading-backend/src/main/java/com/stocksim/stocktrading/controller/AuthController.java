package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.JwtResponse;
import com.stocksim.stocktrading.dto.LoginRequest;
import com.stocksim.stocktrading.dto.MessageResponse;
import com.stocksim.stocktrading.dto.SignupRequest;
import com.stocksim.stocktrading.model.ERole;
import com.stocksim.stocktrading.model.Portfolio;
import com.stocksim.stocktrading.model.Role;
import com.stocksim.stocktrading.model.User;
import com.stocksim.stocktrading.repository.PortfolioRepository;
import com.stocksim.stocktrading.repository.RoleRepository;
import com.stocksim.stocktrading.repository.UserRepository;
import com.stocksim.stocktrading.security.jwt.JwtUtils;
import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * REST Controller for user authentication (registration and login).
 * Handles requests related to /api/auth endpoints.
 */
// Removed @CrossOrigin here. CORS will be handled globally by application.yml.
@RestController // Marks this class as a REST controller
@RequestMapping("/api/auth") // Base path for all endpoints in this controller
public class AuthController {

    // Dependencies injected via constructor
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PortfolioRepository portfolioRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;

    /**
     * Constructor for dependency injection.
     * Spring automatically injects these beans.
     */
    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PortfolioRepository portfolioRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.portfolioRepository = portfolioRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
    }

    /**
     * Handles user login requests.
     * @param loginRequest DTO containing username and password.
     * @return ResponseEntity with JWT token and user details on success, or error message.
     */
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        // Authenticate user credentials using Spring Security's AuthenticationManager
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        // Set the authenticated user in the SecurityContextHolder
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token for the authenticated user
        String jwt = jwtUtils.generateJwtToken(authentication);

        // Get UserDetailsImpl from the authentication object
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Extract user roles as a list of strings
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        // Return JWT response with token and user details
        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getUsername(),
                userDetails.getEmail(),
                roles));
    }

    /**
     * Handles user registration requests.
     * @param signUpRequest DTO containing username, email, and password.
     * @return ResponseEntity with success message or error message.
     */
    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        // Check if username already exists
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Username is already taken!"));
        }

        // Check if email already exists
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("Error: Email is already in use!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getUsername(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword())); // Encode password before saving

        Set<String> strRoles = signUpRequest.getRole();
        Set<Role> roles = new HashSet<>();

        // Assign roles to the user. Default to ROLE_USER if no roles are specified.
        if (strRoles == null || strRoles.isEmpty()) { // Added check for empty set
            Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            roles.add(userRole);
        } else {
            strRoles.forEach(role -> {
                switch (role) {
                    // Case for admin role (if implemented)
                    case "admin":
                        Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(adminRole);
                        break;
                    // Case for moderator role (if implemented)
                    case "mod":
                        Role modRole = roleRepository.findByName(ERole.ROLE_MODERATOR)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(modRole);
                        break;
                    default: // Default to user role
                        Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
                        roles.add(userRole);
                }
            });
        }

        user.setRoles(roles);
        userRepository.save(user); // Save the new user

        // Create a default portfolio for the new user
        // Initial balance can be configured, e.g., $100,000
        Portfolio portfolio = new Portfolio(user, new BigDecimal("100000.00"));
        user.setPortfolio(portfolio); // Link portfolio back to user
        portfolioRepository.save(portfolio); // Save the new portfolio

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }
}
