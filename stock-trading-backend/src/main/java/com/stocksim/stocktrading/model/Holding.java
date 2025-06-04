package com.stocksim.stocktrading.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**

 JPA Entity representing a user's holding of a specific stock within their portfolio.

 Tracks the quantity and average buy price.
 */
@Entity
@Table(name = "holdings",
        uniqueConstraints = {
// Ensure a user can only have one holding entry per stock in their portfolio
                @UniqueConstraint(columnNames = {"portfolio_id", "stock_id"})
        })
@Getter
@Setter
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
public class Holding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing primary key
    private Long id;

    // Many-to-One relationship with Portfolio. A portfolio can have many holdings.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false) // Foreign key to Portfolio entity
    private Portfolio portfolio;

    // Many-to-One relationship with Stock. A holding is for a specific stock.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false) // Foreign key to Stock entity
    private Stock stock;

    @Column(nullable = false)
    private Long quantity; // Number of shares held

    @Column(name = "average_buy_price", nullable = false, precision = 19, scale = 4)
    private BigDecimal averageBuyPrice; // Average price at which the shares were bought

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Timestamp when the holding was first established

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated; // Timestamp of the last update to this holding

    /**

     Constructor for creating a Holding object.

     @param portfolio The portfolio to which this holding belongs.

     @param stock The stock being held.

     @param quantity The initial quantity of shares.

     @param averageBuyPrice The initial average buy price.
     */
    public Holding(Portfolio portfolio, Stock stock, Long quantity, BigDecimal averageBuyPrice) {
        this.portfolio = portfolio;
        this.stock = stock;
        this.quantity = quantity;
        this.averageBuyPrice = averageBuyPrice;
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    @PrePersist // Called before entity is persisted
    @PreUpdate  // Called before entity is updated
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now(); // Update timestamp on every persist/update
    }
}