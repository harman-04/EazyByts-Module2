package com.stocksim.stocktrading.dto;

import com.stocksim.stocktrading.model.Holding;
import com.stocksim.stocktrading.model.Portfolio;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * DTO for representing a user's portfolio.
 * Includes cash balance, holdings, and related information.
 */
@Getter
@Setter
public class PortfolioDTO {
    private Long id;
    private Long userId;
    private String username;
    private BigDecimal cashBalance;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    private List<HoldingDTO> holdings; // Corrected: Specify the generic type as HoldingDTO

    public PortfolioDTO(Portfolio portfolio) {
        this.id = portfolio.getId();
        this.userId = portfolio.getUser().getId();
        this.username = portfolio.getUser().getUsername();
        this.cashBalance = portfolio.getCashBalance();
        this.createdAt = portfolio.getCreatedAt();
        this.lastUpdated = portfolio.getLastUpdated();
        this.holdings = portfolio.getHoldings().stream()
                .map(HoldingDTO::new) // Convert each Holding entity to HoldingDTO
                .collect(Collectors.toList());
    }
}