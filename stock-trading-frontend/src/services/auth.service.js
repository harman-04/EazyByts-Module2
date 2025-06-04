// src/services/auth.service.js
import axios from 'axios';

// Base URL for your Spring Boot backend authentication endpoints
const AUTH_API_URL = 'http://localhost:8080/api/auth/'; // Renamed API_URL for clarity
// Base URL for your Spring Boot backend user endpoints
const USER_API_URL = 'http://localhost:8080/api/user/'; // NEW: for user profile endpoint

/**
 * Helper function to get the authorization header for authenticated requests.
 * @returns {object} - An object containing the Authorization header, or an empty object if no user token.
 */
const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

/**
 * Handles user login.
 * Sends a POST request to the backend with username and password.
 * Stores JWT token and user info in local storage upon successful login.
 * @param {string} username - The user's username.
 * @param {string} password - The user's password.
 * @returns {Promise} - Promise resolving with user data or rejecting with error.
 */
const login = (username, password) => {
  return axios
    .post(AUTH_API_URL + 'signin', {
      username,
      password,
    })
    .then((response) => {
      // If login is successful, store the JWT token and user details
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

/**
 * Handles user registration.
 * Sends a POST request to the backend with username, email, and password.
 * @param {string} username - The desired username.
 * @param {string} email - The user's email.
 * @param {string} password - The desired password.
 * @returns {Promise} - Promise resolving with success message or rejecting with error.
 */
const register = (username, email, password) => {
  return axios.post(AUTH_API_URL + 'signup', {
    username,
    email,
    password,
    role: ['user'], // Default role for new users
  });
};

/**
 * Logs out the current user.
 * Removes user data from local storage.
 */
const logout = () => {
  localStorage.removeItem('user');
};

/**
 * Retrieves the current user data from local storage.
 * @returns {object | null} - The user object if logged in, otherwise null.
 */
const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

/**
 * Fetches the profile details of the currently authenticated user.
 * @returns {Promise} - A promise resolving with the user's profile object.
 */
const getUserProfile = () => {
  return axios.get(USER_API_URL + 'profile', { headers: authHeader() }); // NEW function
};

const authService = {
  register,
  login,
  logout,
  getCurrentUser,
  getUserProfile, // NEW: Export the new function
};

export default authService;