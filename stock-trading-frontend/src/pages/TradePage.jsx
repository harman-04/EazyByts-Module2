// src/pages/TradePage.jsx
import React, { useState, useEffect, useRef } from 'react';
import stockService from '../services/stock.service'; // Service for fetching stock data
import tradeService from '../services/trade.service'; // Service for placing trades
import SockJS from 'sockjs-client'; // For WebSocket connection
import Stomp from 'stompjs'; // STOMP client for WebSocket messaging
import authService from '../services/auth.service'; // Import authService to get current user/token

/**
 * TradePage component for buying and selling stocks.
 * Displays stock search, current price, and order placement forms.
 * Integrates real-time price updates via WebSockets.
 */
const TradePage = () => {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [wsStatus, setWsStatus] = useState('Connecting...'); // State for WebSocket status

  const stompClient = useRef(null); // Ref to hold the STOMP client instance
  const isMounted = useRef(false); // To track if the component is mounted

  // Enable STOMP.js debug logs
  Stomp.WebSocketClass = SockJS; // Ensure Stomp uses SockJS
  Stomp.client.prototype.debug = (str) => {
    // Filter out heart-beat messages for cleaner logs unless needed
    if (str.includes('>>> PING') || str.includes('<<< PONG')) {
      // console.debug("STOMP Debug (Heartbeat):", str);
    } else {
      console.log("STOMP Debug (Trade):", str); // Added "Trade" for clarity
    }
  };

  // Effect for WebSocket connection and subscription
  useEffect(() => {
    isMounted.current = true; // Mark component as mounted

    // Function to connect to WebSocket
    const connectWebSocket = () => {
      // If a client already exists and is connected, no need to reconnect
      if (stompClient.current && stompClient.current.connected) {
        console.log("WebSocket client already connected for Trade. Skipping new connection attempt.");
        setWsStatus('Connected'); // Ensure status is correct if already connected
        return;
      }
      // Also check if it's already in the connecting state
      if (stompClient.current && stompClient.current.ws && stompClient.current.ws.readyState === SockJS.CONNECTING) {
        console.log("WebSocket client for Trade is already in connecting state. Skipping new connection attempt.");
        setWsStatus('Connecting...'); // Ensure status is correct if already connecting
        return;
      }

      console.log('Attempting to connect to WebSocket for Trade...');
      setWsStatus('Connecting...'); // Set status to connecting immediately

      // Backend WebSocket endpoint (SockJS for fallback support)
      const socket = new SockJS('http://localhost:8080/ws');
      // Create a STOMP client over the SockJS socket
      const client = Stomp.over(socket);
      stompClient.current = client; // Assign to ref

      // Get the current user's token from local storage
      const currentUser = authService.getCurrentUser();
      const token = currentUser ? currentUser.token : null;

      const headers = {};
      if (token) {
        headers['Authorization'] = 'Bearer ' + token; // Add JWT to headers if available
      }

      // Connect to the STOMP broker, passing the headers
      stompClient.current.connect(headers, () => { // Pass headers here
        console.log('Connected to WebSocket for Trade!');
        setWsStatus('Connected'); // Update WebSocket status
        if (isMounted.current) {
          setMessage(''); // Clear any previous error messages
        }

        // Subscribe to the public stock price updates topic
        stompClient.current.subscribe('/topic/prices', (wsMessage) => {
          const updatedStock = JSON.parse(wsMessage.body);
          console.log('Received stock update:', updatedStock);
          if (isMounted.current) { // Only update state if component is still mounted
            // If the updated stock is the one currently selected, update its price
            setSelectedStock(prevStock => {
              if (prevStock && prevStock.symbol === updatedStock.symbol) {
                return {
                  ...prevStock,
                  currentPrice: updatedStock.currentPrice,
                  lastUpdated: updatedStock.lastUpdated
                };
              }
              return prevStock;
            });
          }
        });
      }, (error) => {
        console.error('WebSocket connection error for Trade:', error);
        setWsStatus('STOMP Connection Failed'); // Update WebSocket status
        if (isMounted.current) {
          setMessage('WebSocket connection failed. Real-time updates unavailable.');
        }
      });

      // Handle raw SockJS errors and close events
      socket.onclose = (event) => {
        console.log("SockJS connection closed for Trade:", event);
        if (stompClient.current && stompClient.current.connected) { // Check if it was connected
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
        console.error("SockJS error for Trade:", error);
        setWsStatus('SockJS Error'); // Update WebSocket status
        if (isMounted.current) {
          setMessage('WebSocket error. Real-time updates unavailable.');
        }
      };
    };

    // Only attempt to connect if stompClient.current is not yet set (first mount)
    if (!stompClient.current) {
      connectWebSocket(); // Initiate WebSocket connection on component mount
    }


    // Cleanup function: disconnect WebSocket on component unmount
    return () => {
      console.log("TradePage cleanup running...");
      isMounted.current = false; // Mark component as unmounted
      if (stompClient.current) {
        if (stompClient.current.connected) {
          console.log('Disconnecting STOMP client for Trade.');
          stompClient.current.disconnect(() => {
            console.log('STOMP client disconnected callback for Trade.');
          });
        } else if (stompClient.current.ws && stompClient.current.ws.readyState === SockJS.CONNECTING) {
          console.log('Closing underlying SockJS connection directly for Trade (still connecting).');
          stompClient.current.ws.close();
        }
        stompClient.current = null; // Always nullify on cleanup for fresh start in Strict Mode
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  /**
   * Handles stock search by symbol.
   * @param {Event} e - The form submission event.
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setMessage('');
    setSelectedStock(null); // Clear previously selected stock
    if (!searchSymbol) {
      setMessage('Please enter a stock symbol.');
      return;
    }
    setLoading(true);
    // Fetch stock details from the backend using the stock service
    stockService.getStockBySymbol(searchSymbol.toUpperCase())
      .then(response => {
        setSelectedStock(response.data);
        setLoading(false);
      })
      .catch(error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
            error.toString();
        setMessage('Error fetching stock: ' + resMessage);
        setSelectedStock(null);
        setLoading(false);
      });
  };

  /**
   * Handles placing a buy order.
   */
  const handleBuy = () => {
    setMessage('');
    if (!selectedStock || !quantity || quantity <= 0) {
      setMessage('Please select a stock and enter a valid quantity to buy.');
      return;
    }
    setLoading(true);
    // Send buy request to the backend using the trade service
    tradeService.buyStock(selectedStock.symbol, parseInt(quantity))
      .then(response => {
        setMessage(response.data.message || `Successfully bought ${quantity} shares of ${selectedStock.symbol}!`);
        setLoading(false);
        setQuantity(''); // Clear quantity input after successful trade
      })
      .catch(error => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
            error.toString();
        setMessage('Buy error: ' + resMessage);
        setLoading(false);
      });
  };

  /**
   * Handles placing a sell order.
   */
  const handleSell = () => {
    setMessage('');
    if (!selectedStock || !quantity || quantity <= 0) {
      setMessage('Please select a stock and enter a valid quantity to sell.');
      return;
    }
    setLoading(true);
    // Send sell request to the backend using the trade service
    tradeService.sellStock(selectedStock.symbol, parseInt(quantity))
      .then(response => {
        setMessage(response.data.message || `Successfully sold ${quantity} shares of ${selectedStock.symbol}!`);
        setLoading(false);
        setQuantity(''); // Clear quantity input after successful trade
      })
      .catch((error) => {
        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        setMessage('Sell error: ' + resMessage);
        setLoading(false);
      });
  };

  return (
    // Replaced 'bg-background-dark_lighter' with 'bg-gray-800' directly
    <div className="p-6 rounded-lg shadow-lg bg-gray-800">
      <h2 className="text-3xl font-bold text-[#4ade80] mb-6 text-center"> {/* Replaced text-primary with text-[#4ade80] */}
        Place a Trade
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

      {/* Stock Search Section */}
      <div className="mb-8 p-6 bg-gray-700 rounded-lg shadow-md border border-gray-600"> {/* Replaced bg-background-light and border-border-dark with gray shades */}
        <h3 className="text-xl font-semibold text-[#4ade80] mb-4">Search Stock</h3> {/* Replaced text-primary with text-[#4ade80] */}
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="flex-grow px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-[#22c55e] focus:border-[#22c55e] transition duration-200" 
            value={searchSymbol}
            onChange={(e) => setSearchSymbol(e.target.value)}
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-[#4ade80] text-white rounded-md hover:bg-[#22c55e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4ade80] shadow-md transition duration-200" 
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Selected Stock Info and Trade Form */}
      {selectedStock && (
        <div className="p-6 bg-gray-700 rounded-lg shadow-md border border-gray-600"> {/* Replaced bg-background-light and border-border-dark with gray shades */}
          <h3 className="text-xl font-semibold text-[#4ade80] mb-4"> {/* Replaced text-primary with text-[#4ade80] */}
            {selectedStock.name} (<span className="text-[#3b82f6]">{selectedStock.symbol}</span>) {/* Replaced text-secondary with text-[#3b82f6] */}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-400"> {/* Replaced text-text-dark_secondary with text-gray-400 */}
            <p className="text-lg">Current Price: <span className="font-bold text-gray-200">${selectedStock.currentPrice.toFixed(2)}</span></p> {/* Replaced text-text-dark with text-gray-200 */}
            <p className="text-sm">Last Updated: {new Date(selectedStock.lastUpdated).toLocaleString()}</p>
            {/* Add more stock details here if available from DTO */}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <input
              type="number"
              placeholder="Quantity"
              className="w-full sm:w-1/3 px-4 py-2 rounded-md border border-gray-600 bg-gray-700 text-gray-200 focus:outline-none focus:ring-[#22c55e] focus:border-[#22c55e] transition duration-200"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min="1"
              required
            />
            <button
              onClick={handleBuy}
              className="flex-1 py-2 px-4 bg-[#22c55e] text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] shadow-md transition duration-200" 
              disabled={loading || !quantity || quantity <= 0}
            >
              {loading ? 'Buying...' : 'Buy'}
            </button>
            <button
              onClick={handleSell}
              className="flex-1 py-2 px-4 bg-[#ef4444] text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ef4444] shadow-md transition duration-200" 
              disabled={loading || !quantity || quantity <= 0}
            >
              {loading ? 'Selling...' : 'Sell'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradePage;


// // src/pages/TradePage.jsx
// import React, { useState, useEffect, useRef } from 'react';
// import stockService from '../services/stock.service'; // Service for fetching stock data
// import tradeService from '../services/trade.service'; // Service for placing trades
// import SockJS from 'sockjs-client'; // For WebSocket connection
// import Stomp from 'stompjs'; // STOMP client for WebSocket messaging
// import authService from '../services/auth.service'; // Import authService to get current user/token

// /**
//  * TradePage component for buying and selling stocks.
//  * Displays stock search, current price, and order placement forms.
//  * Integrates real-time price updates via WebSockets.
//  */
// const TradePage = () => {
//   const [searchSymbol, setSearchSymbol] = useState('');
//   const [selectedStock, setSelectedStock] = useState(null);
//   const [quantity, setQuantity] = useState('');
//   const [message, setMessage] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [wsStatus, setWsStatus] = useState('Connecting...'); // State for WebSocket status

//   const stompClient = useRef(null); // Ref to hold the STOMP client instance
//   const isMounted = useRef(false); // To track if the component is mounted

//   // Enable STOMP.js debug logs
//   Stomp.WebSocketClass = SockJS; // Ensure Stomp uses SockJS
//   Stomp.client.prototype.debug = (str) => {
//     // Filter out heart-beat messages for cleaner logs unless needed
//     if (str.includes('>>> PING') || str.includes('<<< PONG')) {
//       // console.debug("STOMP Debug (Heartbeat):", str);
//     } else {
//       console.log("STOMP Debug (Trade):", str); // Added "Trade" for clarity
//     }
//   };

//   // Effect for WebSocket connection and subscription
//   useEffect(() => {
//     isMounted.current = true; // Mark component as mounted

//     // Function to connect to WebSocket
//     const connectWebSocket = () => {
//       // If a client already exists and is connected, no need to reconnect
//       if (stompClient.current && stompClient.current.connected) {
//         console.log("WebSocket client already connected for Trade. Skipping new connection attempt.");
//         setWsStatus('Connected'); // Ensure status is correct if already connected
//         return;
//       }
//       // Also check if it's already in the connecting state
//       if (stompClient.current && stompClient.current.ws && stompClient.current.ws.readyState === SockJS.CONNECTING) {
//         console.log("WebSocket client for Trade is already in connecting state. Skipping new connection attempt.");
//         setWsStatus('Connecting...'); // Ensure status is correct if already connecting
//         return;
//       }

//       console.log('Attempting to connect to WebSocket for Trade...');
//       setWsStatus('Connecting...'); // Set status to connecting immediately

//       // Backend WebSocket endpoint (SockJS for fallback support)
//       const socket = new SockJS('http://localhost:8080/ws');
//       // Create a STOMP client over the SockJS socket
//       const client = Stomp.over(socket);
//       stompClient.current = client; // Assign to ref

//       // Get the current user's token from local storage
//       const currentUser = authService.getCurrentUser();
//       const token = currentUser ? currentUser.token : null;

//       const headers = {};
//       if (token) {
//         headers['Authorization'] = 'Bearer ' + token; // Add JWT to headers if available
//       }

//       // Connect to the STOMP broker, passing the headers
//       stompClient.current.connect(headers, () => { // Pass headers here
//         console.log('Connected to WebSocket for Trade!');
//         setWsStatus('Connected'); // Update WebSocket status
//         if (isMounted.current) {
//           setMessage(''); // Clear any previous error messages
//         }

//         // Subscribe to the public stock price updates topic
//         stompClient.current.subscribe('/topic/prices', (wsMessage) => {
//           const updatedStock = JSON.parse(wsMessage.body);
//           console.log('Received stock update:', updatedStock);
//           if (isMounted.current) { // Only update state if component is still mounted
//             // If the updated stock is the one currently selected, update its price
//             setSelectedStock(prevStock => {
//               if (prevStock && prevStock.symbol === updatedStock.symbol) {
//                 return {
//                   ...prevStock,
//                   currentPrice: updatedStock.currentPrice,
//                   lastUpdated: updatedStock.lastUpdated
//                 };
//               }
//               return prevStock;
//             });
//           }
//         });
//       }, (error) => {
//         console.error('WebSocket connection error for Trade:', error);
//         setWsStatus('STOMP Connection Failed'); // Update WebSocket status
//         if (isMounted.current) {
//           setMessage('WebSocket connection failed. Real-time updates unavailable.');
//         }
//       });

//       // Handle raw SockJS errors and close events
//       socket.onclose = (event) => {
//         console.log("SockJS connection closed for Trade:", event);
//         if (stompClient.current && stompClient.current.connected) { // Check if it was connected
//           setWsStatus('Disconnected Unexpectedly');
//           if (isMounted.current) {
//             setMessage('WebSocket connection lost. Real-time updates unavailable.');
//           }
//         } else {
//           setWsStatus('Disconnected');
//           if (isMounted.current) {
//             setMessage('WebSocket connection closed. Real-time updates unavailable.');
//           }
//         }
//       };

//       socket.onerror = (error) => {
//         console.error("SockJS error for Trade:", error);
//         setWsStatus('SockJS Error'); // Update WebSocket status
//         if (isMounted.current) {
//           setMessage('WebSocket error. Real-time updates unavailable.');
//         }
//       };
//     };

//     // Only attempt to connect if stompClient.current is not yet set (first mount)
//     if (!stompClient.current) {
//       connectWebSocket(); // Initiate WebSocket connection on component mount
//     }


//     // Cleanup function: disconnect WebSocket on component unmount
//     return () => {
//       console.log("TradePage cleanup running...");
//       isMounted.current = false; // Mark component as unmounted
//       if (stompClient.current) {
//         if (stompClient.current.connected) {
//           console.log('Disconnecting STOMP client for Trade.');
//           stompClient.current.disconnect(() => {
//             console.log('STOMP client disconnected callback for Trade.');
//           });
//         } else if (stompClient.current.ws && stompClient.current.ws.readyState === SockJS.CONNECTING) {
//           console.log('Closing underlying SockJS connection directly for Trade (still connecting).');
//           stompClient.current.ws.close();
//         }
//         stompClient.current = null; // Always nullify on cleanup for fresh start in Strict Mode
//       }
//     };
//   }, []); // Empty dependency array means this runs once on mount

//   /**
//    * Handles stock search by symbol.
//    * @param {Event} e - The form submission event.
//    */
//   const handleSearch = (e) => {
//     e.preventDefault();
//     setMessage('');
//     setSelectedStock(null); // Clear previously selected stock
//     if (!searchSymbol) {
//       setMessage('Please enter a stock symbol.');
//       return;
//     }
//     setLoading(true);
//     // Fetch stock details from the backend using the stock service
//     stockService.getStockBySymbol(searchSymbol.toUpperCase())
//       .then(response => {
//         setSelectedStock(response.data);
//         setLoading(false);
//       })
//       .catch(error => {
//         const resMessage =
//           (error.response &&
//             error.response.data &&
//             error.response.data.message) ||
//           error.message ||
//             error.toString();
//         setMessage('Error fetching stock: ' + resMessage);
//         setSelectedStock(null);
//         setLoading(false);
//       });
//   };

//   /**
//    * Handles placing a buy order.
//    */
//   const handleBuy = () => {
//     setMessage('');
//     if (!selectedStock || !quantity || quantity <= 0) {
//       setMessage('Please select a stock and enter a valid quantity to buy.');
//       return;
//     }
//     setLoading(true);
//     // Send buy request to the backend using the trade service
//     tradeService.buyStock(selectedStock.symbol, parseInt(quantity))
//       .then(response => {
//         setMessage(response.data.message || `Successfully bought ${quantity} shares of ${selectedStock.symbol}!`);
//         setLoading(false);
//         setQuantity(''); // Clear quantity input after successful trade
//       })
//       .catch(error => {
//         const resMessage =
//           (error.response &&
//             error.response.data &&
//             error.response.data.message) ||
//           error.message ||
//             error.toString();
//         setMessage('Buy error: ' + resMessage);
//         setLoading(false);
//       });
//   };

//   /**
//    * Handles placing a sell order.
//    */
//   const handleSell = () => {
//     setMessage('');
//     if (!selectedStock || !quantity || quantity <= 0) {
//       setMessage('Please select a stock and enter a valid quantity to sell.');
//       return;
//     }
//     setLoading(true);
//     // Send sell request to the backend using the trade service
//     tradeService.sellStock(selectedStock.symbol, parseInt(quantity))
//       .then(response => {
//         setMessage(response.data.message || `Successfully sold ${quantity} shares of ${selectedStock.symbol}!`);
//         setLoading(false);
//         setQuantity(''); // Clear quantity input after successful trade
//       })
//       .catch((error) => {
//         const resMessage =
//           (error.response &&
//             error.response.data &&
//             error.response.data.message) ||
//           error.message ||
//           error.toString();
//         setMessage('Sell error: ' + resMessage);
//         setLoading(false);
//       });
//   };

//   return (
//     <div className="p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#2D3748' }}> {/* background-dark_lighter */}
//       <h2 className="text-3xl font-bold text-center" style={{ color: '#6366F1' }}> {/* primary */}
//         Place a Trade
//       </h2>

//       {message && (
//         <div className={`p-3 rounded-md mb-4 text-center ${message.includes('Error') || message.includes('failed') ? '' : ''} text-white`}
//              style={{ backgroundColor: message.includes('Error') || message.includes('failed') ? '#EF4444' : '#22C55E' }}> {/* error-red or success-green */}
//           {message}
//         </div>
//       )}

//       <div className="text-center mb-4" style={{ color: '#D1D5DB' }}> {/* text-dark_secondary */}
//         WebSocket Status: <span className="font-semibold" style={{ color: wsStatus === 'Connected' ? '#22C55E' : '#FBBF24' }}> {/* green-500 or yellow-500 (approximated) */}
//           {wsStatus}
//         </span>
//       </div>

//       {/* Stock Search Section */}
//       <div className="mb-8 p-6 rounded-lg shadow-md" style={{ backgroundColor: '#374151', border: '1px solid #4B5563' }}> {/* background-light, border-dark */}
//         <h3 className="text-xl font-semibold mb-4" style={{ color: '#6366F1' }}>Search Stock</h3> {/* primary */}
//         <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
//           <input
//             type="text"
//             placeholder="Enter stock symbol (e.g., AAPL)"
//             className="flex-grow px-4 py-2 rounded-md shadow-sm transition duration-200"
//             style={{ border: '1px solid #4B5563', backgroundColor: '#4B5563', color: '#F9FAFB', outline: 'none' }} /* border-dark, gray-700, text-dark */
//             value={searchSymbol}
//             onChange={(e) => setSearchSymbol(e.target.value)}
//             required
//           />
//           <button
//             type="submit"
//             className="px-6 py-2 text-white rounded-md shadow-md transition duration-200"
//             style={{ backgroundColor: '#6366F1' }} /* primary */
//             disabled={loading}
//           >
//             {loading ? 'Searching...' : 'Search'}
//           </button>
//         </form>
//       </div>

//       {/* Selected Stock Info and Trade Form */}
//       {selectedStock && (
//         <div className="p-6 rounded-lg shadow-md" style={{ backgroundColor: '#374151', border: '1px solid #4B5563' }}> {/* background-light, border-dark */}
//           <h3 className="text-xl font-semibold mb-4" style={{ color: '#6366F1' }}> {/* primary */}
//             {selectedStock.name} (<span style={{ color: '#10B981' }}>{selectedStock.symbol}</span>) {/* secondary */}
//           </h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" style={{ color: '#D1D5DB' }}> {/* text-dark_secondary */}
//             <p className="text-lg">Current Price: <span className="font-bold" style={{ color: '#F9FAFB' }}>${selectedStock.currentPrice.toFixed(2)}</span></p> {/* text-dark */}
//             <p className="text-sm">Last Updated: {new Date(selectedStock.lastUpdated).toLocaleString()}</p>
//             {/* Add more stock details here if available from DTO */}
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 items-center">
//             <input
//               type="number"
//               placeholder="Quantity"
//               className="w-full sm:w-1/3 px-4 py-2 rounded-md shadow-sm transition duration-200"
//               style={{ border: '1px solid #4B5563', backgroundColor: '#4B5563', color: '#F9FAFB', outline: 'none' }} /* border-dark, gray-700, text-dark */
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               min="1"
//               required
//             />
//             <button
//               onClick={handleBuy}
//               className="flex-1 py-2 px-4 text-white rounded-md shadow-md transition duration-200"
//               style={{ backgroundColor: '#22C55E' }} /* success-green */
//               disabled={loading || !quantity || quantity <= 0}
//             >
//               {loading ? 'Buying...' : 'Buy'}
//             </button>
//             <button
//               onClick={handleSell}
//               className="flex-1 py-2 px-4 text-white rounded-md shadow-md transition duration-200"
//               style={{ backgroundColor: '#EF4444' }} /* error-red */
//               disabled={loading || !quantity || quantity <= 0}
//             >
//               {loading ? 'Selling...' : 'Sell'}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TradePage;
