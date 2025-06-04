package com.stocksim.stocktrading.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Service for interacting with the Alpha Vantage API to fetch stock data.
 */
@Service
public class AlphaVantageService {

    private static final Logger logger = LoggerFactory.getLogger(AlphaVantageService.class);

    @Value("${alphavantage.api-key}")
    private String apiKey;

    @Value("${alphavantage.base-url}")
    private String baseUrl;

    @Autowired
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Fetches the current global quote (real-time price) for a given stock symbol from Alpha Vantage.
     * @param symbol The stock ticker symbol (e.g., "AAPL").
     * @return An Optional containing the current price as BigDecimal if successful, otherwise empty.
     */
    public Optional<BigDecimal> getGlobalQuote(String symbol) {
        String url = String.format("%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s", baseUrl, symbol, apiKey);
        logger.debug("AlphaVantageService: Attempting to fetch global quote for {} from URL: {}", symbol, url);

        try {
            String jsonResponse = restTemplate.getForObject(url, String.class);
            logger.info("AlphaVantageService: Raw response for {}: {}", symbol, jsonResponse);

            JsonNode root = objectMapper.readTree(jsonResponse);
            JsonNode globalQuote = root.path("Global Quote");

            if (globalQuote.has("05. price")) {
                String priceStr = globalQuote.get("05. price").asText();
                logger.debug("AlphaVantageService: Successfully parsed price for {}: {}", symbol, priceStr);
                return Optional.of(new BigDecimal(priceStr));
            } else {
                logger.warn("AlphaVantageService: No '05. price' found in Alpha Vantage response for {}. Full response: {}", symbol, jsonResponse);
                if (root.has("Error Message")) {
                    logger.error("AlphaVantageService: Alpha Vantage API Error for {}: {}", symbol, root.get("Error Message").asText());
                } else if (root.has("Note")) {
                    logger.warn("AlphaVantageService: Alpha Vantage API Note for {}: {}", symbol, root.get("Note").asText());
                }
            }

        } catch (Exception e) {
            // IMPORTANT: Log the full stack trace to identify the root cause of the API call failure
            logger.error("AlphaVantageService: Error fetching global quote for {}. Returning empty optional.", symbol, e); // Using 'e' directly logs stack trace
            System.err.println("--- Full Stack Trace for AlphaVantageService.getGlobalQuote() error for symbol " + symbol + " ---");
            e.printStackTrace(System.err);
            System.err.println("--- End of Stack Trace ---");
        }
        return Optional.empty();
    }
}
