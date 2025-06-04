// src/services/auth-header.js

/**
 * Returns an authorization header with the JWT token if a user is logged in.
 * @returns {object} - An object containing the Authorization header, or an empty object.
 */
export default function authHeader() {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.token) {
    // For Spring Boot backend, JWT is typically sent as "Bearer "
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
}
