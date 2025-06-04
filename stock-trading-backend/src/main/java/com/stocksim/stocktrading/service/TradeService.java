package com.stocksim.stocktrading.service;

import com.stocksim.stocktrading.dto.PortfolioDTO;
import com.stocksim.stocktrading.dto.TransactionDTO;
import com.stocksim.stocktrading.model.*;
import com.stocksim.stocktrading.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional; // Ensure this import is present
import java.util.stream.Collectors;

@Service
public class TradeService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PortfolioRepository portfolioRepository;

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private HoldingRepository holdingRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public PortfolioDTO buyStock(String username, String symbol, Long quantity) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found for user: " + username));

        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stock not found: " + symbol));

        BigDecimal currentPrice = stock.getCurrentPrice();
        BigDecimal totalCost = currentPrice.multiply(BigDecimal.valueOf(quantity)).setScale(4, RoundingMode.HALF_UP);

        if (portfolio.getCashBalance().compareTo(totalCost) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient funds to buy " + quantity + " shares of " + symbol);
        }

        portfolio.setCashBalance(portfolio.getCashBalance().subtract(totalCost));

        // --- Corrected Line for buyStock ---
        Optional<Holding> existingHolding = holdingRepository.findByPortfolioAndStock(portfolio, stock);
        Holding holding;

        if (existingHolding.isPresent()) {
            holding = existingHolding.get();
            BigDecimal oldTotalValue = holding.getAverageBuyPrice().multiply(BigDecimal.valueOf(holding.getQuantity()));
            BigDecimal newTotalValue = oldTotalValue.add(totalCost);
            Long newQuantity = holding.getQuantity() + quantity;
            BigDecimal newAveragePrice = newTotalValue.divide(BigDecimal.valueOf(newQuantity), 4, RoundingMode.HALF_UP);

            holding.setQuantity(newQuantity);
            holding.setAverageBuyPrice(newAveragePrice);

        } else {
            holding = new Holding(portfolio, stock, quantity, currentPrice);
            portfolio.addHolding(holding);
        }
        holdingRepository.save(holding);

        Transaction transaction = new Transaction(portfolio, stock, TransactionType.BUY, quantity, currentPrice, totalCost);
        portfolio.addTransaction(transaction);
        transactionRepository.save(transaction);

        portfolioRepository.save(portfolio);

        return new PortfolioDTO(portfolio);
    }

    @Transactional
    public PortfolioDTO sellStock(String username, String symbol, Long quantity) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found for user: " + username));

        Stock stock = stockRepository.findBySymbol(symbol)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Stock not found: " + symbol));

        // --- Corrected Line for sellStock ---
        Optional<Holding> holdingOptional = holdingRepository.findByPortfolioAndStock(portfolio, stock);
        if (holdingOptional.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No shares of " + symbol + " found in your portfolio.");
        }

        Holding holding = holdingOptional.get();
        if (holding.getQuantity() < quantity) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient shares of " + symbol + " to sell. You have " + holding.getQuantity() + " shares.");
        }

        BigDecimal currentPrice = stock.getCurrentPrice();
        BigDecimal totalProceeds = currentPrice.multiply(BigDecimal.valueOf(quantity)).setScale(4, RoundingMode.HALF_UP);

        portfolio.setCashBalance(portfolio.getCashBalance().add(totalProceeds));

        if (holding.getQuantity() - quantity == 0) {
            portfolio.removeHolding(holding);
            holdingRepository.delete(holding);
        } else {
            holding.setQuantity(holding.getQuantity() - quantity);
            holdingRepository.save(holding);
        }

        Transaction transaction = new Transaction(portfolio, stock, TransactionType.SELL, quantity, currentPrice, totalProceeds);
        portfolio.addTransaction(transaction);
        transactionRepository.save(transaction);

        portfolioRepository.save(portfolio);

        return new PortfolioDTO(portfolio);
    }

    @Transactional(readOnly = true)
    public PortfolioDTO getUserPortfolio(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found for user: " + username));

        return new PortfolioDTO(portfolio);
    }

    @Transactional(readOnly = true)
    public List<TransactionDTO> getUserTransactions(String username) { // Corrected: Specify List<TransactionDTO>
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        Portfolio portfolio = portfolioRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Portfolio not found for user: " + username));

        return transactionRepository.findByPortfolio(portfolio).stream()
                .map(TransactionDTO::new)
                .collect(Collectors.toList());
    }
}