// src/services/stock.service.js
import axios from 'axios';
import authHeader from './auth-header'; // Utility to get JWT token for requests

// Base URL for your Spring Boot backend stock endpoints
const API_URL = 'http://localhost:8080/api/stocks/';

/**
 * Fetches all available stocks from the backend.
 * Requires authentication.
 * @returns {Promise} - A promise resolving with an array of stock objects.
 */
const getAllStocks = () => {
  return axios.get(API_URL, { headers: authHeader() });
};

/**
 * Fetches a single stock by its symbol from the backend.
 * Requires authentication.
 * @param {string} symbol - The stock ticker symbol.
 * @returns {Promise} - A promise resolving with a single stock object.
 */
const getStockBySymbol = (symbol) => {
  return axios.get(API_URL + symbol, { headers: authHeader() });
};

const stockService = {
  getAllStocks,
  getStockBySymbol,
};

export default stockService;
