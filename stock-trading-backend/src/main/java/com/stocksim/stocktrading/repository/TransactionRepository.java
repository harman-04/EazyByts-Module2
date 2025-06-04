package com.stocksim.stocktrading.repository;

import com.stocksim.stocktrading.model.Portfolio;
import com.stocksim.stocktrading.model.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    // Corrected: Specify Transaction as the generic type for List
    List<Transaction> findByPortfolio(Portfolio portfolio);
}