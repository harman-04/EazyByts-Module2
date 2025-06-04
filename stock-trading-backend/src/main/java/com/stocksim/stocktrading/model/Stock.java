package com.stocksim.stocktrading.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**

 JPA Entity representing a stock available for trading in the simulation.

 Stores information like symbol, name, current price, and last update time.
 */
@Entity
@Table(name = "stocks",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "symbol") // Ensure stock symbol is unique
        })
@Getter
@Setter
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
public class Stock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing primary key
    private Long id;

    @Column(nullable = false, length = 10)
    private String symbol; // Stock ticker symbol (e.g., AAPL, GOOGL)

    @Column(nullable = false, length = 100)
    private String name; // Full company name (e.g., Apple Inc.)

    @Column(name = "current_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal currentPrice; // Current simulated price of the stock

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated; // Timestamp of the last price update

    /**

     Constructor for creating a Stock object.

     @param symbol The stock's ticker symbol.

     @param name The full company name.

     @param currentPrice The initial current price of the stock.
     */
    public Stock(String symbol, String name, BigDecimal currentPrice) {
        this.symbol = symbol;
        this.name = name;
        this.currentPrice = currentPrice;
        this.lastUpdated = LocalDateTime.now(); // Set creation timestamp automatically
    }

    @PrePersist // Called before entity is persisted
    @PreUpdate  // Called before entity is updated
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now(); // Update timestamp on every persist/update
    }
}
