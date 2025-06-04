package com.stocksim.stocktrading.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

/**

 DTO for stock trade requests (buy or sell).
 */
@Getter
@Setter
public class TradeRequest {
    @NotBlank(message = "Stock symbol cannot be blank")
    private String symbol; // The stock ticker symbol (e.g., AAPL)

    @Min(value = 1, message = "Quantity must be at least 1")
    private Long quantity; // Number of shares to buy or sell
}