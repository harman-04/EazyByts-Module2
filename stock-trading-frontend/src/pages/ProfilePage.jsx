// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import authService from '../services/auth.service'; // Ensure correct path to authService

/**
 * ProfilePage component.
 * Displays the authenticated user's profile details.
 */
const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await authService.getUserProfile();
        setUserProfile(response.data);
        setLoading(false);
      } catch (error) {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage('Error fetching profile: ' + resMessage);
        console.error('Error fetching user profile:', error);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []); // Empty dependency array means this runs once on mount

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-lg text-primary-light">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg shadow-xl flex flex-col min-h-[calc(100vh-120px)] bg-gray-900 text-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-primary-dark">
        <span role="img" aria-label="user icon">👤</span> User Profile
      </h2>

      {message && (
        <div className="bg-red-700 text-white p-3 rounded-md mb-4 text-center">
          {message}
        </div>
      )}

      {userProfile ? (
        <div className="bg-gray-800 p-8 rounded-lg shadow-md border border-gray-700 max-w-lg mx-auto w-full space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="font-semibold text-gray-400">User ID:</span>
            <span className="text-gray-200 font-mono">{userProfile.id}</span> {/* Use font-mono for ID */}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="font-semibold text-gray-400">Username:</span>
            <span className="text-primary font-bold text-xl">{userProfile.username}</span> {/* Larger, more prominent username */}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="font-semibold text-gray-400">Email:</span>
            <span className="text-gray-200 break-words">{userProfile.email}</span> {/* Allow email to wrap */}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="font-semibold text-gray-400">Member Since:</span>
            <span className="text-gray-200">{new Date(userProfile.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="font-semibold text-gray-400">Roles:</span>
            <span className="text-gray-200">
              {userProfile.roles && userProfile.roles.length > 0
                ? userProfile.roles.map(role => (
                    <span key={role} className="inline-block bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-1">
                      {role}
                    </span>
                  ))
                : 'N/A'}
            </span>
          </div>
          {/* Add more profile fields or an "Edit Profile" button here */}
          <div className="mt-6 text-center">
            <button
              className="py-3 px-8 bg-primary text-white rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-lg transition duration-200 font-semibold"
              onClick={() => alert('Edit Profile functionality coming soon!')}
            >
              Edit Profile
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No profile data available.</p>
      )}
    </div>
  );
};

export default ProfilePage;