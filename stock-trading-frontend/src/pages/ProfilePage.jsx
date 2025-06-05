// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import authService from '../services/auth.service'; // Ensure correct path to authService

/**
 * ProfilePage component.
 * Displays the authenticated user's profile details and provides functionalities
 * to change password and update email.
 */
const ProfilePage = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showEditForms, setShowEditForms] = useState(false); // State to toggle edit forms

  // State for Change Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  // State for Update Email form
  const [newEmail, setNewEmail] = useState('');
  const [emailCurrentPassword, setEmailCurrentPassword] = useState(''); // Password for email update
  const [emailMessage, setEmailMessage] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await authService.getUserProfile();
      setUserProfile(response.data);
      setMessage(''); // Clear general message on successful fetch
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setMessage('Error fetching profile: ' + resMessage);
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []); // Empty dependency array means this runs once on mount

  // Handle Password Change Submission
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage(''); // Clear previous messages
    setPasswordLoading(true);

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage('New password and confirm new password do not match.');
      setPasswordLoading(false);
      return;
    }

    try {
      const response = await authService.changePassword(currentPassword, newPassword, confirmNewPassword);
      setPasswordMessage(response.data.message || 'Password changed successfully!');
      // Clear password fields on success
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setPasswordMessage('Error changing password: ' + resMessage);
      console.error('Error changing password:', error);
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle Email Update Submission
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    setEmailMessage(''); // Clear previous messages
    setEmailLoading(true);

    // Basic email format validation
    if (!/\S+@\S+\.\S+/.test(newEmail)) {
      setEmailMessage('Please enter a valid email address.');
      setEmailLoading(false);
      return;
    }

    try {
      const response = await authService.updateEmail(newEmail, emailCurrentPassword);
      setEmailMessage(response.data.message || 'Email updated successfully!');
      // Update the user profile displayed on the page immediately
      if (userProfile) {
        setUserProfile(prevProfile => ({ ...prevProfile, email: newEmail }));
      }
      // Clear email fields on success
      setNewEmail('');
      setEmailCurrentPassword('');
    } catch (error) {
      const resMessage =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      setEmailMessage('Error updating email: ' + resMessage);
      console.error('Error updating email:', error);
    } finally {
      setEmailLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)] text-lg text-[#86efac]"> {/* primary-light */}
        Loading profile...
      </div>
    );
  }

  return (
    <div className="p-6 rounded-lg shadow-xl flex flex-col min-h-[calc(100vh-120px)] bg-gray-900 text-gray-200">
      <h2 className="text-3xl font-bold mb-6 text-center text-[#22c55e]"> {/* primary-dark */}
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
            <span className="text-gray-200 font-mono">{userProfile.id}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="font-semibold text-gray-400">Username:</span>
            <span className="text-[#4ade80] font-bold text-xl">{userProfile.username}</span> {/* primary */}
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-700">
            <span className="font-semibold text-gray-400">Email:</span>
            <span className="text-gray-200 break-words">{userProfile.email}</span>
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
          {/* Edit Profile Button */}
          <div className="mt-6 text-center">
            <button
              className="py-3 px-8 bg-[#4ade80] text-white rounded-lg hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] shadow-lg transition duration-200 font-semibold"
              onClick={() => setShowEditForms(!showEditForms)}
            >
              {showEditForms ? 'Hide Edit Options' : 'Edit Profile'}
            </button>
          </div>

          {/* Edit Forms Section (conditionally rendered) */}
          {showEditForms && (
            <div className="mt-8 pt-8 border-t border-gray-700 space-y-8">
              {/* Change Password Form */}
              <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
                <h3 className="text-xl font-bold text-[#86efac] mb-4 text-center">Change Password</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-[#4ade80] focus:border-transparent"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-[#4ade80] focus:border-transparent"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength="6"
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmNewPassword"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-[#4ade80] focus:border-transparent"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      minLength="6"
                    />
                  </div>
                  {passwordMessage && (
                    <div className={`text-center text-sm ${passwordMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                      {passwordMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>

              {/* Update Email Form */}
              <div className="bg-gray-700 p-6 rounded-lg shadow-inner border border-gray-600">
                <h3 className="text-xl font-bold text-[#86efac] mb-4 text-center">Update Email</h3>
                <form onSubmit={handleUpdateEmail} className="space-y-4">
                  <div>
                    <label htmlFor="newEmail" className="block text-sm font-medium text-gray-300 mb-1">
                      New Email
                    </label>
                    <input
                      type="email"
                      id="newEmail"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-[#4ade80] focus:border-transparent"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="emailCurrentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                      Current Password (for verification)
                    </label>
                    <input
                      type="password"
                      id="emailCurrentPassword"
                      className="mt-1 block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm bg-gray-900 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-[#4ade80] focus:border-transparent"
                      value={emailCurrentPassword}
                      onChange={(e) => setEmailCurrentPassword(e.target.value)}
                      required
                    />
                  </div>
                  {emailMessage && (
                    <div className={`text-center text-sm ${emailMessage.includes('successfully') ? 'text-green-500' : 'text-red-500'}`}>
                      {emailMessage}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={emailLoading}
                  >
                    {emailLoading ? 'Updating...' : 'Update Email'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-400 text-center py-8">No profile data available.</p>
      )}
    </div>
  );
};

export default ProfilePage;