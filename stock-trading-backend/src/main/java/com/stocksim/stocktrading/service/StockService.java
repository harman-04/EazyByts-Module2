package com.stocksim.stocktrading.service;

import com.stocksim.stocktrading.dto.StockDTO; // Import StockDTO
import com.stocksim.stocktrading.model.Stock;
import com.stocksim.stocktrading.repository.StockRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate; // Import this for sending WebSocket messages
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Service class for managing stock-related business logic.
 * Interacts with StockRepository to perform CRUD operations on stocks.
 * Also handles scheduled updates of stock prices from an external API and pushes them via WebSockets.
 */
@Service
public class StockService {

    private static final Logger logger = LoggerFactory.getLogger(StockService.class);

    @Autowired
    private StockRepository stockRepository;

    @Autowired
    private AlphaVantageService alphaVantageService;

    @Autowired // Inject SimpMessagingTemplate to send messages over WebSocket
    private SimpMessagingTemplate messagingTemplate;

    @Value("${alphavantage.fetch-interval-ms}")
    private long fetchIntervalMs;

    /**
     * Retrieves all available stocks.
     * @return A list of all Stock entities.
     */
    public List<Stock> getAllStocks() { // ADDED <Stock>
        return stockRepository.findAll();
    }

    /**
     * Retrieves a stock by its symbol.
     * @param symbol The ticker symbol of the stock.
     * @return An Optional containing the Stock if found, otherwise empty.
     */
    public Optional<Stock> getStockBySymbol(String symbol) { // ADDED <Stock>
        return stockRepository.findBySymbol(symbol);
    }

    /**
     * Saves a new stock or updates an existing one.
     * @param stock The Stock entity to save or update.
     * @return The saved or updated Stock entity.
     */
    @Transactional
    public Stock saveStock(Stock stock) {
        return stockRepository.save(stock);
    }

    /**
     * Deletes a stock by its ID.
     * @param id The ID of the stock to delete.
     */
    @Transactional
    public void deleteStock(Long id) {
        stockRepository.deleteById(id);
    }

    /**
     * Checks if a stock with the given symbol exists.
     * @param symbol The symbol to check.
     * @return True if a stock with the symbol exists, false otherwise.
     */
    public Boolean existsBySymbol(String symbol) {
        return stockRepository.existsBySymbol(symbol);
    }

    /**
     * Scheduled task to periodically fetch and update stock prices from Alpha Vantage.
     * The fixedRateString uses the interval defined in application.yml.
     * If a price changes, it pushes the update via WebSocket to clients subscribed to "/topic/prices".
     */
    @Scheduled(fixedRateString = "${alphavantage.fetch-interval-ms}")
    @Transactional // Ensure updates are transactional
    public void updateStockPricesScheduled() {
        logger.info("Scheduled stock price update started at {}", LocalDateTime.now());
        List<Stock> stocks = stockRepository.findAll(); // FIXED: Added <Stock>

        for (Stock stock : stocks) {
            try {
                // Fetch the latest price from Alpha Vantage
                Optional<BigDecimal> newPriceOptional = alphaVantageService.getGlobalQuote(stock.getSymbol()); // FIXED: Added <BigDecimal>

                if (newPriceOptional.isPresent()) {
                    BigDecimal newPrice = newPriceOptional.get(); // Now correctly infers BigDecimal
                    if (newPrice.compareTo(stock.getCurrentPrice()) != 0) { // Only update if price has changed
                        BigDecimal oldPrice = stock.getCurrentPrice(); // Store old price for logging
                        stock.setCurrentPrice(newPrice);
                        stock.setLastUpdated(LocalDateTime.now());
                        stockRepository.save(stock);
                        logger.info("Updated price for {}: from {} to {}", stock.getSymbol(), oldPrice, newPrice);

                        // --- PUSH UPDATE VIA WEBSOCKET ---
                        // Convert the updated Stock entity to a StockDTO before sending
                        messagingTemplate.convertAndSend("/topic/prices", new StockDTO(stock));
                        logger.debug("Pushed price update for {} to /topic/prices", stock.getSymbol());

                    } else {
                        logger.debug("Price for {} remains {}", stock.getSymbol(), newPrice);
                    }
                } else {
                    logger.warn("Could not fetch price for stock: {}", stock.getSymbol());
                }
            } catch (Exception e) {
                logger.error("Error updating price for stock {}: {}", stock.getSymbol(), e.getMessage());
            }
        }
        logger.info("Scheduled stock price update finished.");
    }
}