// src/pages/AnalyticsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Decimal } from 'decimal.js'; // Ensure you have installed decimal.js
import portfolioService from '../services/portfolio.service'; // Assuming you have this service

/**
 * AnalyticsPage component.
 * Displays portfolio performance metrics and a historical cash balance chart.
 * Note: A true historical portfolio value chart (including stock holdings value fluctuations)
 * typically requires backend support for historical stock prices or daily portfolio snapshots.
 * This component currently provides historical cash balance and current overall P&L.
 */
const AnalyticsPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setMessage(''); // Clear previous messages
      try {
        const portfolioResponse = await portfolioService.getMyPortfolio();
        setPortfolio(portfolioResponse.data);

        const transactionsResponse = await portfolioService.getMyTransactions();
        setTransactions(transactionsResponse.data);

        // Process data for charting
        processChartData(portfolioResponse.data, transactionsResponse.data);
      } catch (error) {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage('Error fetching analytics data: ' + resMessage);
        console.error('Error fetching analytics data:', error);
      }
    };

    fetchAnalyticsData();
  }, []);

  /**
   * Processes portfolio and transaction data to generate historical cash balance for charting.
   * This provides a clear, accurate historical view of cash movements.
   * A true historical portfolio value (including stock holdings) would require historical stock prices.
   * @param {object} currentPortfolio - The current portfolio data.
   * @param {Array} transactionHistory - The list of transactions.
   */
  const processChartData = (currentPortfolio, transactionHistory) => {
    if (!currentPortfolio || !transactionHistory) {
      setChartData([]); // Ensure chart data is reset if no portfolio or transactions
      return;
    }

    // Sort transactions by time to build chronological cash balance
    const sortedTransactions = [...transactionHistory].sort(
      (a, b) => new Date(a.transactionTime) - new Date(b.transactionTime)
    );

    let tempChartData = [];
    // Start with the cash balance at the time the portfolio was created
    // This assumes `currentPortfolio.cashBalance` initially reflects the cash when created
    // and transactions subtract/add from it. To accurately get the initial cash *before* any transactions,
    // you might need a dedicated backend endpoint or a specific initial cash value.
    // For now, let's work backward from current cash to initial cash.
    // This is a common pattern for reconstructing historical balances.

    // Calculate the initial cash balance by reversing all transactions
    let initialCashBalance = new Decimal(currentPortfolio.cashBalance);

    // To get the cash balance at `createdAt`, we must sum all transactions if `currentPortfolio.cashBalance`
    // is just the latest.
    // A simpler approach for the chart: use the current cash balance and then apply transactions backward.
    // Or, start with the portfolio's cash_balance at creation time and apply transactions forward.
    // Let's assume currentPortfolio.cashBalance is the most up-to-date and apply transactions backward.
    // However, for charting, it's often easier to build forward from a known start.

    // Let's assume a simplified scenario: start with the current cash and work backward.
    // Or, more robustly: Start with the portfolio's cash balance when it was created.
    // If your `portfolioResponse.data.cashBalance` is current cash, we need to calculate
    // the cash balance at `createdAt`.

    // Simpler: Just track the current cash balance and plot its evolution
    // using the *current* cash balance as a starting point and reversing transactions
    // OR, start from the initial cash balance and apply transactions chronologically.
    // Given `currentPortfolio.cashBalance` is the LATEST, we should calculate historical points.

    // Let's start with the current cash and work backward to get the initial cash balance for the chart.
    // And then build the chart forward from the initial cash.

    // Calculate initial cash by reversing all transactions from current cash
    let currentCashForCalculation = new Decimal(currentPortfolio.cashBalance);
    const reversedTransactions = [...sortedTransactions].reverse();

    reversedTransactions.forEach(tx => {
        const txAmount = new Decimal(tx.totalAmount);
        if (tx.transactionType === 'BUY') {
            currentCashForCalculation = currentCashForCalculation.plus(txAmount); // Add back the cash spent on buy
        } else if (tx.transactionType === 'SELL') {
            currentCashForCalculation = currentCashForCalculation.minus(txAmount); // Subtract the cash received from sell
        }
    });

    let reconstructedCashBalance = currentCashForCalculation; // This should be the cash balance at portfolio creation

    // Add initial point for the chart
    tempChartData.push({
      date: new Date(currentPortfolio.createdAt).toLocaleDateString(),
      cash: reconstructedCashBalance.toFixed(2),
    });

    // Apply transactions forward to reconstruct cash balance history
    sortedTransactions.forEach((tx) => {
      const txAmount = new Decimal(tx.totalAmount);
      if (tx.transactionType === 'BUY') {
        reconstructedCashBalance = reconstructedCashBalance.minus(txAmount);
      } else if (tx.transactionType === 'SELL') {
        reconstructedCashBalance = reconstructedCashBalance.plus(txAmount);
      }
      tempChartData.push({
        date: new Date(tx.transactionTime).toLocaleDateString(),
        cash: reconstructedCashBalance.toFixed(2),
      });
    });

    setChartData(tempChartData);
  };

  // Calculate total portfolio value (cash + holdings value)
  const totalPortfolioValue = portfolio
    ? new Decimal(portfolio.cashBalance).plus(
        portfolio.holdings.reduce(
          (sum, holding) =>
            sum.plus(
              new Decimal(holding.currentPrice).times(
                new Decimal(holding.quantity.toString())
              )
            ),
          new Decimal('0')
        )
      )
    : new Decimal('0');

  // Calculate total overall P&L (current value of holdings - total cost of holdings)
  const totalOverallPnL = portfolio
    ? portfolio.holdings.reduce((sum, holding) => {
        const totalCurrentValue = new Decimal(holding.currentPrice).times(
          new Decimal(holding.quantity.toString())
        );
        const totalCost = new Decimal(holding.averageBuyPrice).times(
          new Decimal(holding.quantity.toString())
        );
        return sum.plus(totalCurrentValue.minus(totalCost));
      }, new Decimal('0'))
    : new Decimal('0');

  // Calculate overall P&L percentage
  const totalInvested = portfolio
    ? portfolio.holdings.reduce(
        (sum, holding) =>
          sum.plus(
            new Decimal(holding.averageBuyPrice).times(
              new Decimal(holding.quantity.toString())
            )
          ),
        new Decimal('0')
      )
    : new Decimal('0');

  const totalOverallPnLPercent = totalInvested.isZero()
    ? new Decimal('0')
    : totalOverallPnL.div(totalInvested).times(new Decimal('100'));

  return (
    <div className="p-6 rounded-lg shadow-lg flex flex-col h-[calc(100vh-120px)]" style={{ backgroundColor: '#2D3748' }}>
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#6366F1' }}>
        Portfolio Analytics
      </h2>

      {message && (
        <div
          className={`p-3 rounded-md mb-4 text-center ${
            message.includes('Error') ? 'bg-red-500' : 'bg-green-500'
          } text-white`}
          role="alert"
          aria-live="polite"
        >
          {message}
        </div>
      )}

      {portfolio ? (
        <>
          {/* Key Metrics */}
          <div
            className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700 grid grid-cols-1 md:grid-cols-3 gap-4"
            aria-label="Portfolio Key Metrics"
          >
            <div aria-label="Current Cash">
              <h3 className="text-xl font-semibold text-primary mb-2">Current Cash</h3>
              <p className="text-3xl font-bold text-text-dark">${new Decimal(portfolio.cashBalance).toFixed(2)}</p>
            </div>
            <div aria-label="Total Portfolio Value">
              <h3 className="text-xl font-semibold text-primary mb-2">Total Portfolio Value</h3>
              <p className="text-3xl font-bold text-text-dark">${totalPortfolioValue.toFixed(2)}</p>
            </div>
            <div aria-label="Overall Profit and Loss">
              <h3 className="text-xl font-semibold text-primary mb-2">Overall P&L</h3>
              <p
                className={`text-3xl font-bold ${
                  totalOverallPnL.isPositive()
                    ? 'text-green-500'
                    : totalOverallPnL.isNegative()
                    ? 'text-red-500'
                    : 'text-text-dark'
                }`}
              >
                ${totalOverallPnL.toFixed(2)} ({totalOverallPnLPercent.toFixed(2)}%)
              </p>
            </div>
          </div>

          {/* Historical Cash Balance Chart */}
          <div
            className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md border border-gray-700"
            aria-label="Historical Cash Balance Chart"
          >
            <h3 className="text-xl font-semibold text-primary mb-4">Historical Cash Balance</h3>
            {chartData.length > 1 ? (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={chartData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />{' '}
                  {/* Gray 700 */}
                  <XAxis dataKey="date" stroke="#D1D5DB" /> {/* Gray 300 */}
                  <YAxis stroke="#D1D5DB" /> {/* Gray 300 */}
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1F2937',
                      border: '1px solid #374151',
                      borderRadius: '5px',
                    }}
                    itemStyle={{ color: '#F3F4F6' }}
                    labelStyle={{ color: '#6366F1' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cash"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                    name="Cash Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-text-dark_secondary text-center py-4">
                Not enough data for a historical chart. Make some transactions!
              </p>
            )}
          </div>

          {/* More detailed analytics (e.g., P&L by stock, daily performance) can be added here */}
        </>
      ) : (
        <p className="text-text-dark_secondary text-center py-8">Loading analytics data...</p>
      )}
    </div>
  );
};

export default AnalyticsPage;