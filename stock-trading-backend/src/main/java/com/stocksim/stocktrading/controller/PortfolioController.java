package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.PortfolioDTO;
import com.stocksim.stocktrading.dto.TransactionDTO;
import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import com.stocksim.stocktrading.service.TradeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing user portfolios and transaction history.
 * All endpoints require user authentication.
 */
@RestController // Marks this class as a REST controller
@RequestMapping("/api/portfolio") // Base path for portfolio-related endpoints
public class PortfolioController {

    private final TradeService tradeService; // Injects TradeService as it contains methods for portfolio and transaction fetching

    // Constructor injection for dependencies
    @Autowired
    public PortfolioController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    /**
     * Retrieves the authenticated user's portfolio details.
     *
     * @param authentication The authenticated user's details.
     * @return ResponseEntity with PortfolioDTO on success, or error message.
     */
    @GetMapping({"", "/"}) // Handles GET requests to both /api/portfolio AND /api/portfolio/
    @PreAuthorize("hasRole('USER')") // Only authenticated users with ROLE_USER can access
    public ResponseEntity<PortfolioDTO> getUserPortfolio(Authentication authentication) {
        // Extract username from authenticated principal
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Fetch portfolio details via TradeService
        PortfolioDTO portfolioDTO = tradeService.getUserPortfolio(userDetails.getUsername());

        // Return the portfolio DTO
        return ResponseEntity.ok(portfolioDTO);
    }

    /**
     * Retrieves the transaction history for the authenticated user's portfolio.
     *
     * @param authentication The authenticated user's details.
     * @return ResponseEntity with a list of TransactionDTOs on success, or error message.
     */
    @GetMapping("/transactions") // Handles GET requests to /api/portfolio/transactions
    @PreAuthorize("hasRole('USER')") // Only authenticated users with ROLE_USER can access
    public ResponseEntity<List<TransactionDTO>> getUserTransactions(Authentication authentication) {
        // Extract username from authenticated principal
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        // Fetch transaction history via TradeService
        List<TransactionDTO> transactionDTOs = tradeService.getUserTransactions(userDetails.getUsername());

        // Return the list of transaction DTOs
        return ResponseEntity.ok(transactionDTOs);
    }
}
