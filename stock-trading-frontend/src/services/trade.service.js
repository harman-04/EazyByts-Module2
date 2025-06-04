// src/services/trade.service.js
import axios from 'axios';
import authHeader from './auth-header'; // Utility to get JWT token for requests

// Base URL for your Spring Boot backend trade endpoints
const API_URL = 'http://localhost:8080/api/trade/';

/**
 * Sends a buy request for a stock.
 * Requires authentication.
 * @param {string} symbol - The stock symbol to buy.
 * @param {number} quantity - The quantity of shares to buy.
 * @returns {Promise} - A promise resolving with a success message or rejecting with an error.
 */
const buyStock = (symbol, quantity) => {
  // Sends a POST request to the buy endpoint with stock details and authentication headers
  return axios.post(API_URL + 'buy', {
    symbol,
    quantity,
  }, { headers: authHeader() });
};

/**
 * Sends a sell request for a stock.
 * Requires authentication.
 * @param {string} symbol - The stock symbol to sell.
 * @param {number} quantity - The quantity of shares to sell.
 * @returns {Promise} - A promise resolving with a success message or rejecting with an error.
 */
const sellStock = (symbol, quantity) => {
  // Sends a POST request to the sell endpoint with stock details and authentication headers
  return axios.post(API_URL + 'sell', {
    symbol,
    quantity,
  }, { headers: authHeader() });
};

// Export the service methods
const tradeService = {
  buyStock,
  sellStock,
};

export default tradeService;
