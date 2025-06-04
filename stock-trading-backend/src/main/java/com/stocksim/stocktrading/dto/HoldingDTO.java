package com.stocksim.stocktrading.dto;

import com.stocksim.stocktrading.model.Holding;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

/**

 DTO for representing a user's stock holding.
 */
@Getter
@Setter
public class HoldingDTO {
    private Long id;
    private String symbol;
    private String stockName;
    private Long quantity;
    private BigDecimal averageBuyPrice;
    private BigDecimal currentPrice; // To show current market value of this holding

    public HoldingDTO(Holding holding) {
        this.id = holding.getId();
        this.symbol = holding.getStock().getSymbol();
        this.stockName = holding.getStock().getName();
        this.quantity = holding.getQuantity();
        this.averageBuyPrice = holding.getAverageBuyPrice();
        this.currentPrice = holding.getStock().getCurrentPrice(); // Get current price from associated Stock
    }
}