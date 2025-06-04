package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.MessageResponse;
import com.stocksim.stocktrading.dto.TradeRequest;
import com.stocksim.stocktrading.security.services.UserDetailsImpl;
import com.stocksim.stocktrading.service.TradeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for handling stock trading operations (buy and sell).
 * All endpoints require user authentication.
 */
// Removed @CrossOrigin here. CORS will be handled globally by application.yml.
@RestController // Marks this class as a REST controller
@RequestMapping("/api/trade") // Base path for trade-related endpoints
public class TradeController {

    private final TradeService tradeService;

    // It's generally better practice to use constructor injection for dependencies
    @Autowired
    public TradeController(TradeService tradeService) {
        this.tradeService = tradeService;
    }

    /**
     * Handles a buy stock request.
     *
     * @param authentication The authenticated user's details.
     * @param tradeRequest DTO containing stock symbol and quantity.
     * @return ResponseEntity with a success message on success, or an error message.
     */
    @PostMapping("/buy") // Handles POST requests to /api/trade/buy
    @PreAuthorize("hasRole('USER')") // Only authenticated users with ROLE_USER can buy
    public ResponseEntity<?> buyStock(Authentication authentication, @Valid @RequestBody TradeRequest tradeRequest) {
        // Extract username from authenticated principal
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        try {
            // Attempt to execute the buy order via TradeService
            tradeService.buyStock(userDetails.getUsername(),
                    tradeRequest.getSymbol(),
                    tradeRequest.getQuantity());

            // Return success response
            return ResponseEntity.ok(new MessageResponse(
                    "Successfully bought " + tradeRequest.getQuantity() + " shares of " + tradeRequest.getSymbol()
            ));
        } catch (Exception e) {
            // Return bad request response with error message
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Handles a sell stock request.
     *
     * @param authentication The authenticated user's details.
     * @param tradeRequest DTO containing stock symbol and quantity.
     * @return ResponseEntity with a success message on success, or an error message.
     */
    @PostMapping("/sell") // Handles POST requests to /api/trade/sell
    @PreAuthorize("hasRole('USER')") // Only authenticated users with ROLE_USER can sell
    public ResponseEntity<?> sellStock(Authentication authentication, @Valid @RequestBody TradeRequest tradeRequest) {
        // Extract username from authenticated principal
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

        try {
            // Attempt to execute the sell order via TradeService
            tradeService.sellStock(userDetails.getUsername(),
                    tradeRequest.getSymbol(),
                    tradeRequest.getQuantity());

            // Return success response
            return ResponseEntity.ok(new MessageResponse(
                    "Successfully sold " + tradeRequest.getQuantity() + " shares of " + tradeRequest.getSymbol()
            ));
        } catch (Exception e) {
            // Return bad request response with error message
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
