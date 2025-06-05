// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#86efac] mb-6 animate-fade-in-down">
          <span role="img" aria-label="stock chart">📈</span> Welcome to StockSim
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-up">
          Your ultimate platform for mastering the stock market. Learn, trade, and analyze in a simulated environment.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up delay-200">
          <Link
            to="/auth" // This will be the path to your AuthPage
            className="bg-[#4ade80] text-gray-900 py-3 px-8 rounded-full text-lg font-bold shadow-lg hover:bg-[#22c55e] transition-all duration-300 transform hover:scale-105"
          >
            Get Started - Register
          </Link>
          <Link
            to="/auth" // This will be the path to your AuthPage, which defaults to Login
            className="bg-gray-700 text-[#86efac] py-3 px-8 rounded-full text-lg font-bold shadow-lg hover:bg-gray-600 hover:text-white transition-all duration-300 transform hover:scale-105"
          >
            Already a user? Login
          </Link>
        </div>
      </div>

      {/* Feature Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl mt-12">
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700 animate-slide-in-left">
          <h3 className="text-3xl font-bold text-[#86efac] mb-4 flex items-center gap-3">
            <span role="img" aria-label="chart with upwards trend">📊</span> Simulated Trading
          </h3>
          <p className="text-gray-300 text-lg">
            Practice trading with real-time market data without risking real money. Build your confidence and strategies.
          </p>
        </div>
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700 animate-fade-in-up delay-400">
          <h3 className="text-3xl font-bold text-[#86efac] mb-4 flex items-center gap-3">
            <span role="img" aria-label="lightbulb">💡</span> Educational Resources
          </h3>
          <p className="text-gray-300 text-lg">
            Access comprehensive guides and articles to understand stock market fundamentals, strategies, and risks.
          </p>
        </div>
        <div className="bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-700 animate-slide-in-right">
          <h3 className="text-3xl font-bold text-[#86efac] mb-4 flex items-center gap-3">
            <span role="img" aria-label="bar chart">📈</span> Portfolio Analytics
          </h3>
          <p className="text-gray-300 text-lg">
            Track your performance, analyze your portfolio's growth, and gain insights into your trading habits.
          </p>
        </div>
      </div>

      {/* Basic Footer */}
      <footer className="w-full text-center text-gray-500 text-sm mt-16 pb-4">
        &copy; {new Date().getFullYear()} StockSim. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;