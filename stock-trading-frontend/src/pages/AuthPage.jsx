// pages/AuthPage.jsx
import React, { useState } from 'react';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';

/**
 * AuthPage component to display either the Login or Register form.
 * Manages the active form state.
 * @param {object} props - Component props.
 * @param {function} props.onAuthSuccess - Callback function on successful authentication (login or register).
 */
const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Register forms

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-dark p-4">
      <div className="bg-background-light p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex mb-6 rounded-md overflow-hidden shadow-sm">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 ${
              isLogin ? 'bg-primary text-white' : 'bg-gray-700 text-text-dark_secondary hover:bg-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 ${
              !isLogin ? 'bg-secondary text-white' : 'bg-gray-700 text-text-dark_secondary hover:bg-gray-600'
            }`}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <LoginForm onLoginSuccess={onAuthSuccess} />
        ) : (
          <RegisterForm onRegisterSuccess={() => {
            alert('Registration successful! You can now log in.');
            setIsLogin(true); // Switch to login form after successful registration
          }} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
