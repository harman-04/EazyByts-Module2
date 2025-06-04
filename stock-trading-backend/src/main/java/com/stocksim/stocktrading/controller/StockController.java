package com.stocksim.stocktrading.controller;

import com.stocksim.stocktrading.dto.StockDTO;
import com.stocksim.stocktrading.model.Stock;
import com.stocksim.stocktrading.service.StockService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST Controller for managing stock-related requests within the StockSim application.
 *
 * This controller provides endpoints for retrieving stock information, primarily
 * for authenticated users with the 'ROLE_USER' authority.
 */
@RestController
@RequestMapping("/api/stocks")
public class StockController {

    private static final Logger logger = LoggerFactory.getLogger(StockController.class);

    private final StockService stockService;

    @Autowired
    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    /**
     * Retrieves a list of all available stocks.
     *
     * This endpoint is accessible only by authenticated users who possess the 'ROLE_USER' authority.
     * It fetches all stock entities from the database and transforms them into
     * Data Transfer Objects (DTOs) before sending them as a response.
     *
     * @return A {@link ResponseEntity} containing a list of {@link StockDTO} objects
     * if successful (HTTP 200 OK).
     */
    @GetMapping({"", "/"}) // FIX: Map to both /api/stocks and /api/stocks/
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<StockDTO>> getAllStocks() {
        logger.info("StockController: Attempting to fetch all stocks for authenticated user.");
        try {
            logger.debug("StockController: Calling stockService.getAllStocks()");
            List<Stock> stocks = stockService.getAllStocks();
            logger.debug("StockController: Received {} stocks from service.", stocks.size());

            List<StockDTO> stockDTOs = stocks.stream()
                    .map(StockDTO::new)
                    .collect(Collectors.toList());

            logger.info("StockController: Successfully fetched {} stocks and converted to DTOs.", stockDTOs.size());
            return ResponseEntity.ok(stockDTOs);
        } catch (Exception e) {
            logger.error("StockController: Error fetching stocks in getAllStocks() method. Returning 500.", e);
            System.err.println("--- Full Stack Trace for StockController.getAllStocks() error ---");
            e.printStackTrace(System.err);
            System.err.println("--- End of Stack Trace ---");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    /**
     * Retrieves a single stock by its ticker symbol.
     *
     * This endpoint is accessible only by authenticated users who possess the 'ROLE_USER' authority.
     * It attempts to find a stock by the provided symbol. If found, it converts the
     * entity to a DTO and returns it. Otherwise, it returns a 404 Not Found response.
     *
     * @param symbol The unique ticker symbol (e.g., "AAPL", "GOOGL") of the stock to retrieve.
     * @return A {@link ResponseEntity} containing the {@link StockDTO} if the stock is found
     * (HTTP 200 OK), or an HTTP 404 Not Found status if no stock matches the symbol.
     */
    @GetMapping("/{symbol}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<StockDTO> getStockBySymbol(@PathVariable String symbol) {
        logger.info("StockController: Attempting to fetch stock by symbol: {}", symbol);
        try {
            return stockService.getStockBySymbol(symbol)
                    .map(stock -> {
                        logger.info("StockController: Found stock: {}", symbol);
                        return new StockDTO(stock);
                    })
                    .map(ResponseEntity::ok)
                    .orElseGet(() -> {
                        logger.warn("StockController: Stock not found for symbol: {}", symbol);
                        return ResponseEntity.notFound().build();
                    });
        } catch (Exception e) {
            logger.error("StockController: Error fetching stock by symbol {} in getStockBySymbol() method. Returning 500.", symbol, e);
            System.err.println("--- Full Stack Trace for StockController.getStockBySymbol() error ---");
            e.printStackTrace(System.err);
            System.err.println("--- End of Stack Trace ---");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
