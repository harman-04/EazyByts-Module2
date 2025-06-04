// src/pages/DashboardPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import stockService from '../services/stock.service'; // Service for fetching stock data
import SockJS from 'sockjs-client'; // For WebSocket connection
import Stomp from 'stompjs'; // STOMP client for WebSocket messaging
import authService from '../services/auth.service'; // Import authService to get current user/token

/**
 * DashboardPage component.
 * Displays a welcome message and a list of available stocks.
 * Integrates real-time price updates via WebSockets.
 */
const DashboardPage = () => {
  const [stocks, setStocks] = useState([]);
  const [message, setMessage] = useState('');
  const [wsStatus, setWsStatus] = useState('Connecting...'); // State for WebSocket status

  // Use a ref to hold the STOMP client to persist across re-renders
  // but manage its connection/disconnection explicitly within useEffect.
  const stompClientRef = useRef(null);
  const isMounted = useRef(false); // To track if the component is mounted

  // Enable STOMP.js debug logs
  // This needs to be set before Stomp.over is called.
  Stomp.WebSocketClass = SockJS;
  Stomp.client.prototype.debug = (str) => {
    // Filter out heart-beat messages for cleaner logs unless needed
    if (str.includes('>>> PING') || str.includes('<<< PONG')) {
      // console.debug("STOMP Debug (Heartbeat):", str);
    } else {
      console.log("STOMP Debug:", str);
    }
  };

  // Effect for initial data fetch and WebSocket connection
  useEffect(() => {
    isMounted.current = true; // Mark component as mounted

    const user = authService.getCurrentUser();
    if (!user || !user.token) {
      setMessage('Error: Not authenticated. Please log in.');
      console.error('No user or token found for fetching stocks.');
      return () => { isMounted.current = false; }; // Cleanup for unauthenticated case
    }

    // Fetch all stocks initially
    stockService.getAllStocks()
      .then(response => {
        if (isMounted.current) {
          setStocks(response.data);
        }
      })
      .catch(error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        if (isMounted.current) {
          setMessage('Error fetching stocks: ' + resMessage);
        }
        console.error('Error fetching stocks:', error);
      });

    const connectWebSocket = () => {
      // If a client already exists and is connected, or we're already trying to connect, do nothing.
      if (stompClientRef.current && stompClientRef.current.connected) {
        console.log("WebSocket client already connected or connecting. Skipping new connection attempt.");
        return;
      }
      if (stompClientRef.current && stompClientRef.current.ws && stompClientRef.current.ws.readyState === SockJS.CONNECTING) {
        console.log("WebSocket client is already in connecting state. Skipping new connection attempt.");
        return;
      }

      console.log('Attempting to connect to WebSocket...');
      if (isMounted.current) {
        setWsStatus('Connecting...');
      }

      const socket = new SockJS('http://localhost:8080/ws');
      stompClientRef.current = Stomp.over(socket);

      const currentUserForWs = authService.getCurrentUser();
      const tokenForWs = currentUserForWs ? currentUserForWs.token : null;

      const headers = {};
      if (tokenForWs) {
        headers['Authorization'] = 'Bearer ' + tokenForWs;
      }

      socket.onopen = () => {
        console.log("SockJS connection opened. Now attempting STOMP connect.");
        // Ensure stompClientRef.current is still valid and component is mounted before connecting
        if (stompClientRef.current && isMounted.current) {
          stompClientRef.current.connect(headers, () => {
            console.log('Connected to WebSocket!');
            if (isMounted.current) {
              setWsStatus('Connected');
              setMessage(''); // Clear any previous error messages
            }

            // Subscribe to the public price updates topic
            stompClientRef.current.subscribe('/topic/prices', (wsMessage) => {
              const updatedStock = JSON.parse(wsMessage.body);
              console.log('Received stock update:', updatedStock);
              if (isMounted.current) {
                setStocks(prevStocks =>
                  prevStocks.map(stock =>
                    stock.symbol === updatedStock.symbol
                      ? { ...stock, currentPrice: updatedStock.currentPrice, lastUpdated: updatedStock.lastUpdated }
                      : stock
                  )
                );
              }
            }, (error) => { // Error callback for subscribe
              console.error('WebSocket subscription error:', error);
              if (isMounted.current) {
                setWsStatus('Subscription Error');
                setMessage('WebSocket subscription failed. Real-time updates unavailable.');
              }
            });

            // --- TEST: Send a message to a test endpoint on backend ---
            stompClientRef.current.send("/app/test", {}, JSON.stringify({ message: "Hello from DashboardPage!" }));
            console.log("Sent test message over WebSocket.");

          }, (error) => { // Error callback for STOMP connect
            console.error('STOMP connection error:', error);
            if (isMounted.current) {
              setWsStatus('STOMP Connection Failed');
              setMessage('WebSocket connection failed. Real-time updates unavailable.');
            }
          });
        } else {
          console.warn("stompClientRef.current is null or component unmounted on SockJS open. Not attempting STOMP connect.");
        }
      };

      socket.onclose = (event) => {
        console.log("SockJS connection closed:", event);
        if (isMounted.current) {
          // Only update status if it wasn't already explicitly set to 'Connected'
          if (!stompClientRef.current || !stompClientRef.current.connected) {
              setWsStatus('Disconnected');
              setMessage('WebSocket connection closed. Real-time updates unavailable.');
          }
        }
      };

      socket.onerror = (error) => {
        console.error("SockJS error:", error);
        if (isMounted.current) {
          setWsStatus('SockJS Error');
          setMessage('WebSocket error. Real-time updates unavailable.');
        }
      };
    };

    connectWebSocket(); // Initiate WebSocket connection

    // Cleanup function: disconnect WebSocket on component unmount
    return () => {
      console.log("DashboardPage cleanup running...");
      isMounted.current = false; // Mark component as unmounted
      if (stompClientRef.current) {
        if (stompClientRef.current.connected) {
          console.log('Disconnecting STOMP client.');
          stompClientRef.current.disconnect(() => {
            console.log('STOMP client disconnected callback.');
          });
        } else if (stompClientRef.current.ws && stompClientRef.current.ws.readyState === SockJS.OPEN) {
          console.log('Closing underlying SockJS connection directly.');
          stompClientRef.current.ws.close();
        }
        stompClientRef.current = null; // Explicitly nullify the ref on unmount
      }
    };
  }, []); // Empty dependency array means this runs once on mount/re-mount in Strict Mode

  return (
    <div className="p-6 bg-background-dark_lighter rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-primary mb-6 text-center">
        Dashboard Overview
      </h2>

      {message && (
        <div className="bg-error-red text-white p-3 rounded-md mb-4 text-center">
          {message}
        </div>
      )}

      <div className="text-center text-text-dark_secondary mb-4">
        WebSocket Status: <span className={`font-semibold ${wsStatus === 'Connected' ? 'text-green-500' : 'text-yellow-500'}`}>
          {wsStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Example Card: Portfolio Summary (Placeholder for future) */}
        <div className="bg-background-light p-6 rounded-lg shadow-md border border-border-dark">
          <h3 className="text-xl font-semibold text-primary mb-3">Portfolio Summary</h3>
          <p className="text-text-dark_secondary">Cash Balance: $100,000.00</p>
          <p className="text-text-dark_secondary">Total Value: $100,000.00</p>
          <p className="text-text-dark_secondary">Today's P&L: +$0.00</p>
          <button className="mt-4 w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition duration-200">
            View Portfolio
          </button>
        </div>

        {/* Available Stocks Section */}
        <div className="lg:col-span-2 bg-background-light p-6 rounded-lg shadow-md border border-border-dark">
          <h3 className="text-xl font-semibold text-primary mb-4">Available Stocks</h3>
          {stocks.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-dark">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-dark_secondary uppercase tracking-wider rounded-tl-md">
                      Symbol
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-dark_secondary uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-dark_secondary uppercase tracking-wider">
                      Current Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-dark_secondary uppercase tracking-wider rounded-tr-md">
                      Last Updated
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background-light divide-y divide-border-dark">
                  {stocks.map((stock) => (
                    <tr key={stock.id} className="hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary-dark">
                        {stock.symbol}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        {stock.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark">
                        ${stock.currentPrice ? stock.currentPrice.toFixed(2) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-dark_secondary">
                        {stock.lastUpdated ? new Date(stock.lastUpdated).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-dark_secondary">Loading stocks or no stocks available...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
