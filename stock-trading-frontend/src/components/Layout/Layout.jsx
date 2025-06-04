// src/components/Layout/Layout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Layout component for authenticated pages.
 * Provides a consistent dark mode background, header with navigation, and main content area.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content to be rendered within the layout.
 * @param {function} props.onLogout - Callback function for logging out.
 * @param {string} props.username - The username of the currently logged-in user.
 */
const Layout = ({ children, onLogout, username }) => {
  const location = useLocation(); // Hook to get current path for active link styling

  // Define navigation links
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Trade', path: '/trade' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Chat', path: '/chat' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Education', path: '/education' },
  ];

  return (
    <div className="min-h-screen bg-background-dark text-text-dark flex flex-col">
      {/* Header */}
      <header className="bg-background-light p-4 shadow-md">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          {/* Logo */}
          <Link to="/dashboard" className="text-2xl font-bold text-primary mb-4 sm:mb-0">
            StockSim
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-text-dark_secondary font-medium hover:text-primary-dark transition-colors duration-200
                  ${location.pathname === link.path ? 'text-primary-dark border-b-2 border-primary-dark pb-1' : ''}`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <span className="text-text-dark_secondary text-lg font-semibold">
              Hello,{' '}
              {/* Wrapped username with Link to profile */}
              <Link to="/profile" className="text-primary hover:underline transition-colors duration-200">
                {username}
              </Link>!
            </span>
            <button
              onClick={onLogout}
              className="py-2 px-4 bg-error-red text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-red shadow-md transition duration-200 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow container mx-auto p-4">
        {children}
      </main>

      {/* Footer (optional) */}
      <footer className="w-full bg-background-light p-4 text-center text-text-dark_secondary text-sm">
        &copy; {new Date().getFullYear()} StockSim. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;