// src/pages/AuthPage.jsx
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h1 className="text-3xl font-extrabold text-center text-[#86efac] mb-8"> {/* primary-light: #86efac */}
          <span role="img" aria-label="chart icon" className="mr-2">📈</span>
          Welcome to StockSim
        </h1>

        <div className="flex mb-8 rounded-lg overflow-hidden shadow-lg border border-gray-700">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 text-lg font-bold transition-all duration-300 ease-in-out
              ${isLogin
                ? 'bg-[#4ade80] text-white scale-105 shadow-md z-10' // primary: #4ade80
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              } border-r border-gray-600 first:rounded-l-lg last:rounded-r-lg`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 text-lg font-bold transition-all duration-300 ease-in-out
              ${!isLogin
                ? 'bg-[#3b82f6] text-white scale-105 shadow-md z-10' // secondary: #3b82f6
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              } border-l border-gray-600 first:rounded-l-lg last:rounded-r-lg`}
          >
            Register
          </button>
        </div>

        {isLogin ? (
          <LoginForm key="login-form" onLoginSuccess={onAuthSuccess} />
        ) : (
          <RegisterForm key="register-form" onRegisterSuccess={() => {
            alert('Registration successful! You can now log in.');
            setIsLogin(true); // Switch to login form after successful registration
          }} />
        )}
      </div>
    </div>
  );
};

export default AuthPage;