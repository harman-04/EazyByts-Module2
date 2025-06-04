package com.stocksim.stocktrading.security.jwt;

import com.stocksim.stocktrading.security.services.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 Custom filter to process JWT authentication token for each incoming request.
 It extends OncePerRequestFilter to ensure it's executed only once per request.
 */
public class AuthTokenFilter extends OncePerRequestFilter {

    @Autowired // Injects JwtUtils for token operations
    private JwtUtils jwtUtils;

    @Autowired // Injects UserDetailsServiceImpl to load user details
    private UserDetailsServiceImpl userDetailsService;

    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    /**
     Filters incoming requests to validate JWT token and set authentication.
     @param request The HTTP request.
     @param response The HTTP response.
     @param filterChain The filter chain.
     @throws ServletException if a servlet-specific error occurs.
     @throws IOException if an I/O error occurs.
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
// 1. Parse JWT from the request header
            String jwt = parseJwt(request);
            if (jwt != null && jwtUtils.validateJwtToken(jwt)) {
// 2. Extract username from JWT
                String username = jwtUtils.getUserNameFromJwtToken(jwt);

                // 3. Load UserDetails for the extracted username
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                // 4. Create an authentication object
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities());

                // 5. Set authentication details (remote address, session ID)
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 6. Set the authentication object in the SecurityContextHolder
                // This indicates that the user is authenticated for the current request
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

        } catch (Exception e) {
            logger.error("Cannot set user authentication: {}", e.getMessage());
        }

// Continue with the filter chain
        filterChain.doFilter(request, response);
    }

    /**
     Extracts JWT token from the Authorization header (Bearer token).
     @param request The HTTP request.
     @return The JWT string, or null if not found or not in Bearer format.
     */
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

// Check if Authorization header exists and starts with "Bearer "
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7); // Return the token part after "Bearer "
        }

        return null;
    }
}