// src/components/Layout/Layout.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

/**
 * Layout component.
 * Provides a consistent dark mode background, header with navigation, and main content area.
 * It now handles both authenticated and unauthenticated states for navigation.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The content to be rendered within the layout.
 * @param {function} [props.onLogout] - Callback function for logging out (only for authenticated users).
 * @param {string} [props.username] - The username of the currently logged-in user.
 * @param {boolean} props.isLoggedIn - Indicates if a user is currently logged in.
 */
const Layout = ({ children, onLogout, username, isLoggedIn }) => {
  const location = useLocation(); // Hook to get current path for active link styling

  // Define navigation links for authenticated users
  const authNavLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Trade', path: '/trade' },
    { name: 'Portfolio', path: '/portfolio' },
    { name: 'Chat', path: '/chat' },
    { name: 'Analytics', path: '/analytics' },
    { name: 'Education', path: '/education' },
  ];

  // Define navigation links for unauthenticated users (Home, Login, Register)
  const publicNavLinks = [
    { name: 'Home', path: '/' },
    // AuthPage handles both login and register internally, so one link suffices
    { name: 'Login / Register', path: '/auth' },
  ];

  const currentNavLinks = isLoggedIn ? authNavLinks : publicNavLinks;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
      {/* Header */}
      <header className="w-full bg-gray-800 p-4 shadow-lg border-b border-gray-700">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
          {/* Logo */}
          <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2 text-[#86efac] text-3xl font-extrabold mb-4 sm:mb-0 transition-colors duration-300 hover:text-[#22c55e]">
            <span role="img" aria-label="stock chart">📈</span> StockSim
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-6 sm:gap-8">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-gray-300 text-lg font-medium hover:text-[#4ade80] transition-all duration-300 relative group
                  ${location.pathname === link.path || (link.path === '/auth' && (location.pathname === '/login' || location.pathname === '/register'))
                    ? 'text-[#22c55e] font-bold' // Active link color
                    : ''
                  }`}
              >
                {link.name}
                {/* Active link indicator - a subtle line below the active link */}
                {(location.pathname === link.path || (link.path === '/auth' && (location.pathname === '/login' || location.pathname === '/register'))) && (
                  <span className="absolute bottom-[-5px] left-0 w-full h-1 bg-[#22c55e] rounded-full scale-x-100 origin-center transition-transform duration-300"></span>
                )}
                {/* Hover underline effect */}
                <span className="absolute bottom-[-5px] left-0 w-full h-1 bg-[#86efac] rounded-full scale-x-0 group-hover:scale-x-100 origin-center transition-transform duration-300 opacity-60"></span>
              </Link>
            ))}
          </nav>

          {/* User Info & Logout (only for logged-in users) */}
          {isLoggedIn && (
            <div className="flex items-center gap-4 mt-4 sm:mt-0 bg-gray-700 px-4 py-2 rounded-full shadow-inner">
              <span className="text-gray-300 text-lg font-semibold flex items-center gap-2">
                <span role="img" aria-label="user avatar">👋</span> Hello,{' '}
                <Link to="/profile" className="text-[#4ade80] hover:text-[#86efac] transition-colors duration-200 font-bold">
                  {username}
                </Link>!
              </span>
              <button
                onClick={onLogout}
                className="py-2 px-5 bg-red-600 text-white rounded-full hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md transition duration-300 text-sm font-semibold flex items-center gap-1"
              >
                <span role="img" aria-label="logout icon">🚪</span> Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 p-4 text-center text-gray-400 text-sm border-t border-gray-700">
        &copy; {new Date().getFullYear()} StockSim. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;