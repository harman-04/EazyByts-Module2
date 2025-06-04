// src/services/portfolio.service.js
import axios from 'axios';
import authHeader from './auth-header'; // Utility to get JWT token for requests

// Base URL for your Spring Boot backend portfolio endpoints
const API_URL = 'http://localhost:8080/api/portfolio/';

/**
 * Fetches the current user's portfolio details.
 * Requires authentication.
 * @returns {Promise} - A promise resolving with the user's portfolio object.
 */
const getMyPortfolio = () => {
  // Sends a GET request to the backend portfolio endpoint with authentication headers
  return axios.get(API_URL, { headers: authHeader() });
};

/**
 * Fetches the current user's transaction history.
 * Requires authentication.
 * @returns {Promise} - A promise resolving with an array of transaction objects.
 */
const getMyTransactions = () => {
  // Sends a GET request to the backend transactions endpoint with authentication headers
  return axios.get(API_URL + 'transactions', { headers: authHeader() });
};

// Export the service methods
const portfolioService = {
  getMyPortfolio,
  getMyTransactions,
};

export default portfolioService;
