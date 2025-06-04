package com.stocksim.stocktrading.dto;

import com.stocksim.stocktrading.model.Transaction;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**

 DTO for representing a stock transaction record.
 */
@Getter
@Setter
public class TransactionDTO {
    private Long id;
    private String stockSymbol;
    private String stockName;
    private String transactionType; // "BUY" or "SELL"
    private Long quantity;
    private BigDecimal pricePerShare;
    private BigDecimal totalAmount;
    private LocalDateTime transactionTime;

    public TransactionDTO(Transaction transaction) {
        this.id = transaction.getId();
        this.stockSymbol = transaction.getStock().getSymbol();
        this.stockName = transaction.getStock().getName();
        this.transactionType = transaction.getType().name(); // Get string representation of enum
        this.quantity = transaction.getQuantity();
        this.pricePerShare = transaction.getPricePerShare();
        this.totalAmount = transaction.getTotalAmount();
        this.transactionTime = transaction.getTransactionTime();
    }
}
