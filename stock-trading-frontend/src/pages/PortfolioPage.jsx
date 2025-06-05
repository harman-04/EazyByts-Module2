// src/pages/PortfolioPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import portfolioService from '../services/portfolio.service'; // Service for fetching portfolio data
import SockJS from 'sockjs-client'; // For WebSocket connection
import Stomp from 'stompjs'; // STOMP client for WebSocket messaging
import BigDecimal from 'js-big-decimal'; // Corrected import
import authService from '../services/auth.service'; // Import authService to get current user/token

// Diagnostic log for BigDecimal's toString method (this will show if the module's toString is native)
console.log("BigDecimal.prototype.toString (from module):", BigDecimal.prototype.toString);


/**
 * PortfolioPage component.
 * Displays user's cash balance, stock holdings, and transaction history.
 * Integrates real-time price updates for holdings via WebSockets.
 */
const PortfolioPage = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [message, setMessage] = useState('');
  const [wsStatus, setWsStatus] = useState('Connecting...'); // State for WebSocket status

  // Use a ref to hold the STOMP client to persist across re-renders
  const stompClientRef = useRef(null);
  const isMounted = useRef(false); // To track if the component is mounted

  // Enable STOMP.js debug logs
  Stomp.WebSocketClass = SockJS;
  Stomp.client.prototype.debug = (str) => {
    // Filter out heart-beat messages for cleaner logs unless needed
    if (str.includes('>>> PING') || str.includes('<<< PONG')) {
      // console.debug("STOMP Debug (Heartbeat):", str);
    } else {
      console.log("STOMP Debug (Portfolio):", str); // Added "Portfolio" for clarity
    }
  };

  /**
   * Fetches the user's portfolio and transactions from the backend.
   */
  const fetchPortfolioData = () => {
    setMessage(''); // Clear previous messages
    console.log("Fetching portfolio data...");
    portfolioService.getMyPortfolio()
      .then(response => {
        console.log("Portfolio API response:", response.data);
        if (isMounted.current) { // Only update state if component is still mounted
          // Convert BigDecimal-like strings from backend to BigDecimal objects
          const rawPortfolio = response.data;
          const processedPortfolio = {
            ...rawPortfolio,
            // Ensure cashBalance is converted to BigDecimal
            cashBalance: new BigDecimal(rawPortfolio.cashBalance ? rawPortfolio.cashBalance.toString() : '0'),
            holdings: rawPortfolio.holdings.map(holding => ({
              ...holding,
              // Ensure currentPrice and averageBuyPrice are handled as BigDecimal
              currentPrice: new BigDecimal(holding.currentPrice ? holding.currentPrice.toString() : '0'),
              averageBuyPrice: new BigDecimal(holding.averageBuyPrice ? holding.averageBuyPrice.toString() : '0'),
            })),
          };
          setPortfolio(processedPortfolio);
          console.log("Portfolio state updated:", processedPortfolio);
        }
      })
      .catch(error => {
        console.error('Error fetching portfolio (full error object):', error);
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        if (isMounted.current) {
          setMessage('Error fetching portfolio: ' + resMessage);
        }
        console.error('Error fetching portfolio message:', resMessage);
      });

    console.log("Fetching transactions data...");
    portfolioService.getMyTransactions()
      .then(response => {
        console.log("Transactions API response:", response.data);
        if (isMounted.current) { // Only update state if component is still mounted
          // Convert BigDecimal-like strings from backend to BigDecimal objects for transactions
          const processedTransactions = response.data.map(tx => ({
            ...tx,
            pricePerShare: new BigDecimal(tx.pricePerShare ? tx.pricePerShare.toString() : '0'),
            totalAmount: new BigDecimal(tx.totalAmount ? tx.totalAmount.toString() : '0'),
          }));
          setTransactions(processedTransactions);
          console.log("Transactions state updated:", processedTransactions);
        }
      })
      .catch(error => {
        console.error('Error fetching transactions (full error object):', error);
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        if (isMounted.current) {
          setMessage(prev => (prev ? prev + '\n' : '') + 'Error fetching transactions: ' + resMessage);
        }
        console.error('Error fetching transactions message:', resMessage);
      });
  };

  // Effect for initial data fetch and WebSocket connection
  useEffect(() => {
    isMounted.current = true; // Mark component as mounted

    const user = authService.getCurrentUser();
    if (!user || !user.token) {
      setMessage('Error: Not authenticated. Please log in.');
      console.error('No user or token found for fetching portfolio.');
      return () => { isMounted.current = false; }; // Cleanup for unauthenticated case
    }

    fetchPortfolioData(); // Initial fetch of portfolio and transactions

    // Function to connect to WebSocket
    const connectWebSocket = () => {
      // If a client already exists and is connected, no need to reconnect
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("WebSocket client already connected for Portfolio. Skipping new connection attempt.");
        setWsStatus('Connected'); // Ensure status is correct if already connected
        return;
      }
      // Also check if it's already in the connecting state
      if (stompClientRef.current && stompClientRef.current.ws && stompClientRef.current.ws.readyState === SockJS.CONNECTING) {
        console.log("WebSocket client for Portfolio is already in connecting state. Skipping new connection attempt.");
        setWsStatus('Connecting...'); // Ensure status is correct if already connecting
        return;
      }

      console.log('Attempting to connect to WebSocket for Portfolio...');
      setWsStatus('Connecting...'); // Set status to connecting immediately

      const socket = new SockJS('http://localhost:8080/ws');
      const client = Stomp.over(socket);
      stompClientRef.current = client; // Assign to ref

      const tokenForWs = user ? user.token : null;
      const headers = {};
      if (tokenForWs) {
        headers['Authorization'] = 'Bearer ' + tokenForWs;
      }

      // Directly call connect without waiting for socket.onopen
      stompClientRef.current.connect(headers, () => {
        console.log('Connected to WebSocket for Portfolio!');
        setWsStatus('Connected'); // Update WebSocket status
        if (isMounted.current) {
          setMessage(''); // Clear any previous error messages
        }

        stompClientRef.current.subscribe('/topic/prices', (wsMessage) => {
          const updatedStock = JSON.parse(wsMessage.body);
          console.log('Received stock update for portfolio:', updatedStock);
          if (isMounted.current) {
            setPortfolio(prevPortfolio => {
              if (!prevPortfolio) return prevPortfolio;

              const updatedHoldings = prevPortfolio.holdings.map(holding => {
                if (holding.symbol === updatedStock.symbol) {
                  return { ...holding, currentPrice: new BigDecimal(updatedStock.currentPrice.toString()) };
                }
                return holding;
              });
              return {
                ...prevPortfolio,
                holdings: updatedHoldings,
              };
            });
          }
        });
      }, (error) => {
        console.error('STOMP connection error for Portfolio:', error);
        setWsStatus('STOMP Connection Failed'); // Update WebSocket status
        if (isMounted.current) {
          setMessage('WebSocket connection failed. Real-time updates unavailable.');
        }
      });

      // Handle raw SockJS errors and close events
      socket.onclose = (event) => {
        console.log("SockJS connection closed for Portfolio:", event);
        // Only update status if it's not already 'Connected' (meaning it was disconnected unexpectedly)
        if (stompClientRef.current && stompClientRef.current.connected) { // Check if it was connected
          setWsStatus('Disconnected Unexpectedly');
          if (isMounted.current) {
            setMessage('WebSocket connection lost. Real-time updates unavailable.');
          }
        } else {
          setWsStatus('Disconnected');
          if (isMounted.current) {
            setMessage('WebSocket connection closed. Real-time updates unavailable.');
          }
        }
      };

      socket.onerror = (error) => {
        console.error("SockJS error for Portfolio:", error);
        setWsStatus('SockJS Error'); // Update WebSocket status
        if (isMounted.current) {
          setMessage('WebSocket error. Real-time updates unavailable.');
        }
      };
    };

    connectWebSocket();

    return () => {
      console.log("PortfolioPage cleanup running...");
      isMounted.current = false;
      if (stompClientRef.current) {
        if (stompClientRef.current.connected) {
          console.log('Disconnecting STOMP client for Portfolio.');
          stompClientRef.current.disconnect(() => {
            console.log('STOMP client disconnected callback for Portfolio.');
          });
        } else if (stompClientRef.current.ws && stompClientRef.current.ws.readyState === SockJS.CONNECTING) {
          console.log('Closing underlying SockJS connection directly for Portfolio (still connecting).');
          stompClientRef.current.ws.close();
        }
        stompClientRef.current = null; // Always nullify on cleanup for fresh start in Strict Mode
      }
    };
  }, []); // Empty dependency array means this runs once on mount/re-mount in Strict Mode

  // Calculate total portfolio value (cash + holdings value) - memoized for performance
  const totalPortfolioValue = React.useMemo(() => {
    if (!portfolio) return new BigDecimal('0');
    const holdingsValue = portfolio.holdings.reduce((sum, holding) =>
      sum.add(holding.currentPrice.multiply(new BigDecimal(holding.quantity.toString()))),
      new BigDecimal('0')
    );
    return portfolio.cashBalance.add(holdingsValue);
  }, [portfolio]);

  // Helper to calculate unrealized P&L for a holding
  const calculateUnrealizedPnL = (holding) => {
    const totalCurrentValue = holding.currentPrice.multiply(new BigDecimal(holding.quantity.toString()));
    const totalCost = holding.averageBuyPrice.multiply(new BigDecimal(holding.quantity.toString()));
    return totalCurrentValue.subtract(totalCost);
  };

  // Helper to calculate percentage P&L for a holding
  const calculateUnrealizedPnLPercent = (holding) => {
    const pnl = calculateUnrealizedPnL(holding);
    const totalCost = holding.averageBuyPrice.multiply(new BigDecimal(holding.quantity.toString()));
    if (totalCost.compareTo(new BigDecimal('0')) === 0) return new BigDecimal('0'); // Avoid division by zero
    return pnl.divide(totalCost, 4, BigDecimal.ROUND_HALF_UP).multiply(new BigDecimal('100'));
  };

  return (
    // Replaced 'bg-background-dark_lighter' with 'bg-gray-800' directly
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-[#4ade80] mb-6 text-center"> {/* Replaced text-primary with text-[#4ade80] */}
        My Portfolio
      </h2>

      {message && (
        <div className={`p-3 rounded-md mb-4 text-center ${message.includes('Error') || message.includes('failed') ? 'bg-[#ef4444]' : 'bg-[#22c55e]'} text-white`}> {/* Replaced bg-error-red and bg-success-green with hex codes */}
          {message}
        </div>
      )}

      <div className="text-center text-gray-400 mb-4"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
        WebSocket Status: <span className={`font-semibold ${wsStatus === 'Connected' ? 'text-green-500' : 'text-yellow-500'}`}>
          {wsStatus}
        </span>
      </div>

      {portfolio ? (
        <>
          {/* Portfolio Summary */}
          <div className="mb-8 p-6 bg-gray-700 rounded-lg shadow-md border border-gray-600 grid grid-cols-1 md:grid-cols-3 gap-4"> {/* Replaced bg-background-light and border-border-dark with gray shades */}
            <div>
              <h3 className="text-xl font-semibold text-[#4ade80] mb-2">Cash Balance</h3> {/* Replaced text-primary with text-[#4ade80] */}
              {/* DEBUG LOG: Check the type and value right before rendering */}
              {console.log("DEBUG: portfolio.cashBalance (initial):", typeof portfolio.cashBalance, portfolio.cashBalance)}
              {console.log("DEBUG: portfolio.cashBalance.round(2):", typeof portfolio.cashBalance.round(2), portfolio.cashBalance.round(2))}
              {/* FIX: Use parseFloat and toFixed on the .value property */}
              <p className="text-3xl font-bold text-gray-200">${parseFloat(portfolio.cashBalance.value).toFixed(2)}</p> {/* Replaced text-text-dark with text-gray-200 */}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-[#4ade80] mb-2">Total Holdings Value</h3> {/* Replaced text-primary with text-[#4ade80] */}
              <p className="text-3xl font-bold text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                {/* Dynamically calculate total holdings value */}
                {/* FIX: Use parseFloat and toFixed on the .value property */}
                ${parseFloat(portfolio.holdings.reduce((sum, h) => sum.add(h.currentPrice.multiply(new BigDecimal(h.quantity.toString()))), new BigDecimal('0')).value).toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="xl font-semibold text-[#4ade80] mb-2">Total Portfolio Value</h3> {/* Replaced text-primary with text-[#4ade80] */}
              {/* FIX: Use parseFloat and toFixed on the .value property */}
              <p className="text-3xl font-bold text-gray-200">${parseFloat(totalPortfolioValue.value).toFixed(2)}</p> {/* Replaced text-text-dark with text-gray-200 */}
            </div>
          </div>

          {/* Current Holdings */}
          <div className="mb-8 p-6 bg-gray-700 rounded-lg shadow-md border border-gray-600"> {/* Replaced bg-background-light and border-border-dark with gray shades */}
            <h3 className="text-xl font-semibold text-[#4ade80] mb-4">Current Holdings</h3> {/* Replaced text-primary with text-[#4ade80] */}
            {portfolio.holdings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600"> {/* Replaced divide-border-dark with divide-gray-600 */}
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tl-md"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Symbol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Avg. Buy Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Current Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Total Value
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tr-md"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Unrealized P&L
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-700 divide-y divide-gray-600"> {/* Replaced bg-background-light and divide-border-dark with gray shades */}
                    {portfolio.holdings.map((holding) => (
                      <tr key={holding.symbol} className="hover:bg-gray-600 transition-colors duration-150"> {/* Changed hover:bg-gray-700 to hover:bg-gray-600 for contrast */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#4ade80]"> {/* Replaced text-primary-dark with text-[#4ade80] */}
                          {holding.symbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {holding.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {/* FIX: Use parseFloat and toFixed on the .value property */}
                          ${parseFloat(holding.averageBuyPrice.value).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {/* FIX: Use parseFloat and toFixed on the .value property */}
                          ${parseFloat(holding.currentPrice.value).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {/* FIX: Use parseFloat and toFixed on the .value property */}
                          ${parseFloat(holding.currentPrice.multiply(new BigDecimal(holding.quantity.toString())).value).toFixed(2)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${
                          calculateUnrealizedPnL(holding).compareTo(new BigDecimal('0')) > 0 ? 'text-[#22c55e]' : // Replaced text-success-green with hex code
                          calculateUnrealizedPnL(holding).compareTo(new BigDecimal('0')) < 0 ? 'text-[#ef4444]' : // Replaced text-error-red with hex code
                          'text-gray-400' // Replaced text-text-dark_secondary with text-gray-400
                        }`}>
                          {/* FIX: Use parseFloat and toFixed on the .value property */}
                          ${parseFloat(calculateUnrealizedPnL(holding).value).toFixed(2)} ({parseFloat(calculateUnrealizedPnLPercent(holding).value).toFixed(2)}%)
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No holdings in your portfolio yet.</p> // Replaced text-text-dark_secondary with text-gray-400
            )}
          </div>

          {/* Transaction History */}
          <div className="p-6 bg-gray-700 rounded-lg shadow-md border border-gray-600"> {/* Replaced bg-background-light and border-border-dark with gray shades */}
            <h3 className="text-xl font-semibold text-[#4ade80] mb-4">Transaction History</h3> {/* Replaced text-primary with text-[#4ade80] */}
            {transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-600"> {/* Replaced divide-border-dark with divide-gray-600 */}
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tl-md"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Type
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Symbol
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Price/Share
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider rounded-tr-md"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                        Total Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-700 divide-y divide-gray-600"> {/* Replaced bg-background-light and divide-border-dark with gray shades */}
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-600 transition-colors duration-150"> {/* Changed hover:bg-gray-700 to hover:bg-gray-600 for contrast */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
                          {new Date(tx.transactionTime).toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${tx.transactionType === 'BUY' ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}> {/* Replaced text-success-green and text-error-red with hex codes */}
                          {tx.transactionType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#4ade80]"> {/* Replaced text-primary-dark with text-[#4ade80] */}
                          {tx.stockSymbol}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {tx.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {/* FIX: Use parseFloat and toFixed on the .value property */}
                          ${parseFloat(tx.pricePerShare.value).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200"> {/* Replaced text-text-dark with text-gray-200 */}
                          {/* FIX: Use parseFloat and toFixed on the .value property */}
                          ${parseFloat(tx.totalAmount.value).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No transactions recorded yet.</p> // Replaced text-text-dark_secondary with text-gray-400
            )}
          </div>
        </>
      ) : (
        <p className="text-gray-400 text-center py-8">Loading portfolio data...</p> // Replaced text-text-dark_secondary with text-gray-400
      )}
    </div>
  );
};

export default PortfolioPage;