// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import AppWrapper from './App'; // Import AppWrapper
import './index.css'; // Ensure Tailwind CSS is imported

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppWrapper /> {/* Render AppWrapper */}
  </React.StrictMode>,
);