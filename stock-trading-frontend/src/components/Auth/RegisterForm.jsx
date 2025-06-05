// src/components/Auth/RegisterForm.jsx
import React, { useState } from 'react';
import authService from '../../services/auth.service';

/**
 * RegisterForm component for user registration.
 * Handles user registration and displays messages.
 * @param {object} props - Component props.
 * @param {function} props.onRegisterSuccess - Callback function on successful registration.
 */
const RegisterForm = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.register(username, email, password);
      setMessage(response.data?.message || 'Registration successful! You can now log in.');
      setLoading(false);
      setUsername('');
      setEmail('');
      setPassword('');
      onRegisterSuccess();
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage(resMessage);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-5">
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium text-gray-300 mb-1">
          Username
        </label>
        <input
          type="text"
          id="reg-username"
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent sm:text-base transition duration-300" // secondary: #3b82f6
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-gray-300 mb-1">
          Email
        </label>
        <input
          type="email"
          id="reg-email"
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent sm:text-base transition duration-300" // secondary: #3b82f6
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          required
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          type="password"
          id="reg-password"
          className="mt-1 block w-full px-4 py-2 border border-gray-600 rounded-lg shadow-sm bg-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-transparent sm:text-base transition duration-300" // secondary: #3b82f6
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Create a strong password"
          required
        />
      </div>
      <div className="pt-2">
        <button
          type="submit"
          className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-[#3b82f6] hover:bg-[#2563eb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed" // secondary: #3b82f6, secondary-dark: #2563eb
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registering...
            </span>
          ) : (
            'Register'
          )}
        </button>
      </div>
      {message && (
        <div className={`mt-4 text-center text-sm font-medium ${message.includes('successful') ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}> {/* success-green: #22c55e, error-red: #ef4444 */}
          {message}
        </div>
      )}
    </form>
  );
};

export default RegisterForm;