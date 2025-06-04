// src/pages/EducationPage.jsx
import React from 'react';

/**
 * EducationPage component.
 * Provides basic educational resources about stock trading.
 */
const EducationPage = () => {
  return (
    <div className="p-6 rounded-lg shadow-xl flex flex-col min-h-[calc(100vh-120px)] bg-gray-900 text-gray-200"> {/* Changed main text color to gray-200 */}
      {/* Page Title with Hero Section Feel */}
      <div className="bg-gradient-to-r from-primary-dark to-primary-light p-8 rounded-lg shadow-lg mb-8 text-white text-center">
        <h1 className="text-4xl font-extrabold mb-3 drop-shadow-md">
          <span role="img" aria-label="lightbulb">💡</span> Stock Market Fundamentals
        </h1>
        <p className="text-lg opacity-90 max-w-2xl mx-auto">
          Embark on your journey into the world of stock trading. Learn essential concepts, strategies, and risk management techniques.
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">

        {/* Section 1: Introduction to Stock Market */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-2xl font-semibold text-primary mb-4 flex items-center">
            <span className="mr-2 text-3xl">📈</span> Introduction
          </h3>
          <p className="mb-3 leading-relaxed text-gray-300"> {/* Changed paragraph text color to gray-300 */}
            The stock market is a platform where shares of publicly listed companies are bought and sold.
            When you buy a stock, you become a part-owner of that company. The value of your stock can
            change based on the company's performance, industry trends, economic conditions, and market sentiment.
          </p>
          <p className="leading-relaxed text-gray-300"> {/* Changed paragraph text color to gray-300 */}
            Understanding the basics is key before you begin trading. This section provides a simplified
            overview of some fundamental concepts.
          </p>
        </div>

        {/* Section 2: Why Invest in Stocks? */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-2xl font-semibold text-primary mb-4 flex items-center">
            <span className="mr-2 text-3xl">💰</span> Why Invest?
          </h3>
          <ul className="list-disc list-inside space-y-3 text-gray-300"> {/* Changed list item text color to gray-300 */}
            <li>
              <strong className="text-primary-dark">Capital Appreciation:</strong> The value of your stocks can increase over time, allowing you to sell them for a profit.
            </li>
            <li>
              <strong className="text-primary-dark">Dividends:</strong> Some companies pay out a portion of their profits to shareholders in the form of dividends.
            </li>
            <li>
              <strong className="text-primary-dark">Inflation Hedge:</strong> Historically, stocks have outperformed inflation, helping your money maintain its purchasing power.
            </li>
            <li>
              <strong className="text-primary-dark">Diversification:</strong> Stocks can be part of a diversified investment portfolio, reducing overall risk.
            </li>
          </ul>
        </div>

        {/* Section 3: Key Terms to Know */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:shadow-lg transition-shadow duration-300">
          <h3 className="text-2xl font-semibold text-primary mb-4 flex items-center">
            <span className="mr-2 text-3xl">📚</span> Key Terms
          </h3>
          <ul className="list-disc list-inside space-y-3 text-gray-300"> {/* Changed list item text color to gray-300 */}
            <li>
              <strong className="text-primary-dark">Stock Symbol/Ticker:</strong> Unique abbreviation (e.g., AAPL).
            </li>
            <li>
              <strong className="text-primary-dark">Share:</strong> A single unit of company ownership.
            </li>
            <li>
              <strong className="text-primary-dark">Portfolio:</strong> Collection of all investments.
            </li>
            <li>
              <strong className="text-primary-dark">Bid Price:</strong> Highest buyer offer.
            </li>
            <li>
              <strong className="text-primary-dark">Ask Price:</strong> Lowest seller acceptance.
            </li>
            <li>
              <strong className="text-primary-dark">Market Order:</strong> Buy/sell immediately at current price.
            </li>
            <li>
              <strong className="text-primary-dark">Limit Order:</strong> Buy/sell at a specific price or better.
            </li>
            <li>
              <strong className="text-primary-dark">Volatility:</strong> Degree of price variation over time.
            </li>
            <li>
              <strong className="text-primary-dark">Dividend:</strong> Portion of profits paid to shareholders.
            </li>
          </ul>
        </div>

        {/* Section 4: Risk Management */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-md border border-gray-700 hover:shadow-lg transition-shadow duration-300 md:col-span-2 lg:col-span-3">
          <h3 className="text-2xl font-semibold text-primary mb-4 flex items-center">
            <span className="mr-2 text-3xl">⚠️</span> Risk Management
          </h3>
          <p className="mb-3 leading-relaxed text-gray-300"> {/* Changed paragraph text color to gray-300 */}
            Investing in the stock market involves risk. It's crucial to understand and manage these risks:
          </p>
          <ul className="list-disc list-inside space-y-3 text-gray-300"> {/* Changed list item text color to gray-300 */}
            <li>
              <strong className="text-primary-dark">Diversification:</strong> Don't put all your eggs in one basket. Spread your investments across different companies and industries.
            </li>
            <li>
              <strong className="text-primary-dark">Research:</strong> Understand the companies you're investing in, their financials, and market position.
            </li>
            <li>
              <strong className="text-primary-dark">Long-Term vs. Short-Term:</strong> Long-term investing generally carries less risk and greater potential for returns than short-term speculation.
            </li>
            <li>
              <strong className="text-primary-dark">Only Invest What You Can Afford to Lose:</strong> Never invest money that you might need in the near future for essential expenses.
            </li>
          </ul>
        </div>

      </div>

      {/* Disclaimer / Footer */}
      <p className="text-center text-sm bg-gray-800 p-4 rounded-lg shadow-md border border-gray-700 mt-8 text-gray-400 italic"> {/* Changed disclaimer text color to gray-400 */}
        <span role="img" aria-label="warning">❗</span> This is a simplified overview for educational purposes in a simulated environment. Always conduct thorough research and consider consulting a qualified financial advisor before making real investment decisions.
      </p>
    </div>
  );
};

export default EducationPage;