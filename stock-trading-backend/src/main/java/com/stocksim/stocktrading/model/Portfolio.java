// Portfolio.java
package com.stocksim.stocktrading.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList; // Used for initializing lists
import java.util.List;

/**
 * JPA Entity representing a user's investment portfolio.
 * Each user has one portfolio that tracks their cash balance, holdings, and transactions.
 */
@Entity
@Table(name = "portfolios") // Table name for portfolios
@Getter
@Setter
@NoArgsConstructor // Lombok annotation to generate a no-argument constructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-incrementing primary key
    private Long id;

    // One-to-One relationship with User.
    // 'mappedBy = "portfolio"' indicates that the 'portfolio' field in the User entity is the owner.
    // 'cascade = CascadeType.ALL' ensures that if a portfolio is deleted, its user is also deleted (or vice versa depending on owning side).
    // 'fetch = FetchType.LAZY' means the user is loaded only when explicitly accessed.
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true) // Foreign key to User entity
    private User user;

    @Column(name = "cash_balance", nullable = false, precision = 19, scale = 4)
    private BigDecimal cashBalance; // Current cash available for trading

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt; // Timestamp of portfolio creation

    @Column(name = "last_updated", nullable = false)
    private LocalDateTime lastUpdated; // Timestamp of the last update to cash balance or holdings

    // Corrected line: Specify the generic type as Holding
    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Holding> holdings = new ArrayList<>(); // List of stocks the user currently holds

    // One-to-Many relationship with Transactions.
    // 'mappedBy = "portfolio"' indicates that the 'portfolio' field in the Transaction entity is the owner.
    // 'cascade = CascadeType.ALL' ensures that operations like persist, merge, remove will cascade to transactions.
    @OneToMany(mappedBy = "portfolio", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions = new ArrayList<>(); // Corrected: Also specify for Transaction if needed

    /**
     * Constructor for creating a Portfolio object with a user and initial cash.
     * @param user The associated user.
     * @param initialCash The starting cash balance for the portfolio.
     */
    public Portfolio(User user, BigDecimal initialCash) {
        this.user = user;
        this.cashBalance = initialCash;
        this.createdAt = LocalDateTime.now();
        this.lastUpdated = LocalDateTime.now();
    }

    @PrePersist // Called before entity is persisted
    @PreUpdate  // Called before entity is updated
    protected void onUpdate() {
        this.lastUpdated = LocalDateTime.now(); // Update timestamp on every persist/update
    }

    // Helper method to add a holding to the portfolio
    public void addHolding(Holding holding) {
        holdings.add(holding);
        holding.setPortfolio(this);
    }

    // Helper method to remove a holding from the portfolio
    public void removeHolding(Holding holding) {
        holdings.remove(holding);
        holding.setPortfolio(null); // Break bidirectional link
    }

    // Helper method to add a transaction to the portfolio
    public void addTransaction(Transaction transaction) {
        transactions.add(transaction);
        transaction.setPortfolio(this);
    }
}