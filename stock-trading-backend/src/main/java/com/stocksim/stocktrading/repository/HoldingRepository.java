// src/main/java/com/stocksim/stocktrading/repository/HoldingRepository.java

package com.stocksim.stocktrading.repository;

import com.stocksim.stocktrading.model.Holding;
import com.stocksim.stocktrading.model.Portfolio;
import com.stocksim.stocktrading.model.Stock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Long> {

    // Corrected: Specify <Holding> for the Optional return type
    Optional<Holding> findByPortfolioAndStock(Portfolio portfolio, Stock stock);

    // Corrected: Specify <Holding> for the List return type
    List<Holding> findByPortfolio(Portfolio portfolio);
}