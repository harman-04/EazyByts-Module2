package com.stocksim.stocktrading.dto;

import com.stocksim.stocktrading.model.Stock;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**

 DTO for representing stock information.

 Used for sending stock data from the backend to the frontend.
 */
@Getter
@Setter
public class StockDTO {
    private Long id;
    private String symbol;
    private String name;
    private BigDecimal currentPrice;
    private LocalDateTime lastUpdated;

    /**

     Constructor to create a StockDTO from a Stock entity.

     @param stock The Stock entity to convert.
     */
    public StockDTO(Stock stock) {
        this.id = stock.getId();
        this.symbol = stock.getSymbol();
        this.name = stock.getName();
        this.currentPrice = stock.getCurrentPrice();
        this.lastUpdated = stock.getLastUpdated();
    }
}
