package com.stocksim.stocktrading.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA Entity representing a trade transaction (buy or sell).
 * Records details about each order.
 */
@Entity
@Table(name = "transactions") // Table name for transactions
@Getter
@Setter
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing primary key
    private Long id;

    // Many-to-One relationship with Portfolio. A portfolio can have many transactions.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false) // Foreign key to Portfolio entity
    private Portfolio portfolio;

    // Many-to-One relationship with Stock. A transaction is for a specific stock.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stock_id", nullable = false) // Foreign key to Stock entity
    private Stock stock;

    @Enumerated(EnumType.STRING) // Store enum as String in DB (e.g., "BUY", "SELL")
    @Column(name = "transaction_type", nullable = false, length = 10)
    private TransactionType type; // Type of transaction (BUY or SELL)

    @Column(nullable = false)
    private Long quantity; // Number of shares traded

    @Column(name = "price_per_share", nullable = false, precision = 19, scale = 4)
    private BigDecimal pricePerShare; // Price per share at the time of transaction

    @Column(name = "total_amount", nullable = false, precision = 19, scale = 4)
    private BigDecimal totalAmount; // Total amount of the transaction (quantity * pricePerShare)

    @Column(name = "transaction_time", nullable = false)
    private LocalDateTime transactionTime; // Timestamp of the transaction

    /**
     * Constructor for creating a Transaction object.
     * @param portfolio The portfolio involved in the transaction.
     * @param stock The stock involved.
     * @param type The type of transaction (BUY/SELL).
     * @param quantity The number of shares traded.
     * @param pricePerShare The price per share at the time of transaction.
     * @param totalAmount The total amount of the transaction.
     */
    public Transaction(Portfolio portfolio, Stock stock, TransactionType type,
                       Long quantity, BigDecimal pricePerShare, BigDecimal totalAmount) {
        this.portfolio = portfolio;
        this.stock = stock;
        this.type = type;
        this.quantity = quantity;
        this.pricePerShare = pricePerShare;
        this.totalAmount = totalAmount;
        this.transactionTime = LocalDateTime.now(); // Set transaction timestamp automatically
    }
}