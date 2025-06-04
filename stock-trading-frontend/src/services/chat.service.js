import axios from 'axios';
import authHeader from './auth-header'; // Assuming you have an auth-header service

// Base URL for your Spring Boot backend chat REST endpoints
const API_URL = 'http://localhost:8080/api/chat/';

/**
 * Fetches the recent chat history for a given chat room.
 * @param {string} chatRoomId - The ID of the chat room (e.g., 'public').
 * @returns {Promise} - A promise resolving with an array of chat message objects.
 */
const getChatHistory = (chatRoomId = 'public') => {
  return axios.get(API_URL + 'history/' + chatRoomId, { headers: authHeader() });
};

const chatService = {
  getChatHistory,
};

export default chatService;