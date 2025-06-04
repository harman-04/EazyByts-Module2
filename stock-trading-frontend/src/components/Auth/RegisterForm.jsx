import React, { useState } from 'react';
import authService from '../../services/auth.service';

const RegisterForm = ({ onRegisterSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    authService["register"](username, email, password)
      .then((response) => {
        setMessage(response["data"]?.["message"] || 'Registration successful!');
        setLoading(false);
        setUsername('');
        setEmail('');
        setPassword('');
        onRegisterSuccess();
      })
      .catch((error) => {
        const resMessage =
          (error["response"] &&
            error["response"]["data"] &&
            error["response"]["data"]["message"]) ||
          error["message"] ||
          error.toString();
        setMessage(resMessage);
        setLoading(false);
      });
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div>
        <label htmlFor="reg-username" className="block text-sm font-medium text-text-dark_secondary">
          Username
        </label>
        <input
          type="text"
          id="reg-username"
          className="mt-1 block w-full px-4 py-2 border border-border-dark rounded-md shadow-sm bg-background-light text-text-dark focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-200"
          value={username}
          onChange={(e) => setUsername(e["target"]["value"])}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-email" className="block text-sm font-medium text-text-dark_secondary">
          Email
        </label>
        <input
          type="email"
          id="reg-email"
          className="mt-1 block w-full px-4 py-2 border border-border-dark rounded-md shadow-sm bg-background-light text-text-dark focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-200"
          value={email}
          onChange={(e) => setEmail(e["target"]["value"])}
          required
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="block text-sm font-medium text-text-dark_secondary">
          Password
        </label>
        <input
          type="password"
          id="reg-password"
          className="mt-1 block w-full px-4 py-2 border border-border-dark rounded-md shadow-sm bg-background-light text-text-dark focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition duration-200"
          value={password}
          onChange={(e) => setPassword(e["target"]["value"])}
          required
        />
      </div>
      <div className="mt-6">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-secondary hover:bg-secondary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary transition duration-200 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </div>
      {message && (
        <div className={`mt-4 text-center text-sm ${message.includes('successful') ? 'text-success-green' : 'text-error-red'}`}>
          {message}
        </div>
      )}
    </form>
  );
};

export default RegisterForm;
