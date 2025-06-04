package com.stocksim.stocktrading.repository;

import com.stocksim.stocktrading.model.Portfolio;
import com.stocksim.stocktrading.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, Long> {
    // Corrected: Specify Portfolio as the generic type for Optional
    Optional<Portfolio> findByUser(User user);
}