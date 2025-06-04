// components/Auth/LoginForm.jsx
import React, { useState } from 'react';
import authService from '../../services/auth.service'; // Adjust path if necessary

/**
 * LoginForm component for user authentication.
 * Handles user login and displays messages.
 * @param {object} props - Component props.
 * @param {function} props.onLoginSuccess - Callback function on successful login.
 */
const LoginForm = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission for login.
   * @param {Event} e - The form submission event.
   */
  const handleLogin = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    authService.login(username, password)
      .then(() => {
        onLoginSuccess();
      })
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage(resMessage);
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-text-dark_secondary">
          Username
        </label>
        <input
          type="text"
          id="username"
          className="mt-1 block w-full px-4 py-2 border border-border-dark rounded-md shadow-sm bg-background-light text-text-dark focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-200"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-text-dark_secondary">
          Password
        </label>
        <input
          type="password"
          id="password"
          className="mt-1 block w-full px-4 py-2 border border-border-dark rounded-md shadow-sm bg-background-light text-text-dark focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {/* ADDED: Explicit margin-top to ensure button is separated and visible */}
      <div className="mt-6"> {/* Changed from default space-y-4 behavior to explicit mt-6 for clarity */}
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </div>
      {message && (
        <div className="mt-4 text-center text-error-red text-sm">
          {message}
        </div>
      )}
    </form>
  );
};

export default LoginForm;
