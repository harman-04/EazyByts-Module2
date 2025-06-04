// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import TradePage from './pages/TradePage'; // Import the new TradePage
import PortfolioPage from './pages/PortfolioPage'; // Import the new PortfolioPage
import Layout from './components/Layout/Layout';
import authService from './services/auth.service';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EducationPage from './pages/EducationPage';
import ProfilePage from './pages/ProfilePage';
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
   * Clears user data, sets currentUser to undefined, and navigates back to auth page.
   */
  const handleLogout = () => {
    authService.logout();
    setCurrentUser(undefined);
    navigate('/'); // Navigate back to authentication page after logout
  };

  return (
    <>
      {/* Conditional rendering based on authentication status */}
      {currentUser ? (
        // Authenticated user layout with navigation
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <DashboardPage />
              </Layout>
            }
          />
          <Route
            path="/trade" // New Trade Route
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <TradePage />
              </Layout>
            }
          />
          <Route
            path="/portfolio" // New Portfolio Route
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <PortfolioPage />
              </Layout>
            }
          />
          <Route
            path="/chat"
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <ChatPage />
              </Layout>
            }
          />
           <Route
            path="/analytics" // NEW Analytics Route
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <AnalyticsPage />
              </Layout>
            }
          />
          <Route
            path="/education" // NEW Education Route
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <EducationPage />
              </Layout>
            }
          />
           <Route
            path="/profile" // NEW Profile Route
            element={
              <Layout onLogout={handleLogout} username={currentUser.username}>
                <ProfilePage />
              </Layout>
            }
          />
          {/* Future routes for Chat, Analytics, Education, etc. will go here */}
          {/* Default route for authenticated users - redirects to dashboard if already logged in */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      ) : (
        // Unauthenticated user: show authentication page
        <Routes>
          <Route path="/" element={<AuthPage onAuthSuccess={handleAuthSuccess} />} />
          {/* Redirect any other path to auth */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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
