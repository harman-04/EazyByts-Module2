// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TradePage from './pages/TradePage';
import PortfolioPage from './pages/PortfolioPage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EducationPage from './pages/EducationPage';
import ProfilePage from './pages/ProfilePage';
import HomePage from './pages/HomePage'; // Import the new HomePage
import Layout from './components/Layout/Layout';
import authService from './services/auth.service';

/**
 * Main application component.
 * Manages user authentication state and conditionally renders content based on authentication status.
 * Integrates React Router for navigation.
 */
function App() {
  const [currentUser, setCurrentUser] = useState(undefined); // State to hold current logged-in user
  const navigate = useNavigate(); // Hook for programmatic navigation

  // Check for current user on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  /**
   * Handles successful authentication (login/register).
   * Updates the currentUser state and navigates to the dashboard.
   */
  const handleAuthSuccess = () => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    navigate('/dashboard'); // Navigate to dashboard after successful login/registration
  };

  /**
   * Handles user logout.
   * Clears user data, sets currentUser to undefined, and navigates back to the home page.
   */
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(undefined);
    navigate('/'); // Navigate back to home page after logout
  };

  return (
    <>
      {/* Conditional rendering based on authentication status */}
      {currentUser ? (
        // Authenticated user layout with navigation
        <Layout onLogout={handleLogout} username={currentUser.username} isLoggedIn={!!currentUser}>
          <Routes>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/education" element={<EducationPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* Redirect any other path to dashboard for logged-in users */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
      ) : (
        // Unauthenticated user: show public layout or direct auth page
        <Layout isLoggedIn={!!currentUser}> {/* Pass isLoggedIn as false */}
          <Routes>
            <Route path="/" element={<HomePage />} /> {/* Default Home Page */}
            <Route path="/auth" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
            {/* Redirect any other path to home for unauthenticated users */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

/**
 * Wrapper component to provide Router context to App.
 * This is necessary because useNavigate must be used within a Router.
 */
function AppWrapper() {
  return (
    <BrowserRouter> {/* Use BrowserRouter for client-side routing */}
      <App />
    </BrowserRouter>
  );
}

export default AppWrapper;