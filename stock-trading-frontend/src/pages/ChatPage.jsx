import React, { useState, useEffect, useRef } from 'react';
import chatService from '../services/chat.service';
import authService from '../services/auth.service';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

/**
 * ChatPage component for real-time messaging.
 * Displays chat history and allows users to send messages.
 */
const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [messageError, setMessageError] = useState('');
  const [stompStatus, setStompStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const stompClient = useRef(null);
  const messagesEndRef = useRef(null); // Ref for auto-scrolling to bottom
  const reconnectTimeout = useRef(null); // Ref for reconnection timeout

  const currentUser = authService.getCurrentUser(); // Get current user details
  const chatRoomId = 'public'; // For now, a single public chat room

  // Ref to track if the component is mounted to prevent state updates on unmounted component
  const isMounted = useRef(false);

  // Enable STOMP.js debug logs (optional, but useful for debugging)
  Stomp.WebSocketClass = SockJS; // Ensure Stomp uses SockJS
  Stomp.client.prototype.debug = (str) => {
    // Filter out heart-beat messages for cleaner logs unless needed
    if (str.includes('>>> PING') || str.includes('<<< PONG')) {
      // console.debug("STOMP Debug (Chat - Heartbeat):", str);
    } else {
      console.log("STOMP Debug (Chat):", str);
    }
  };

  // Function to connect to WebSocket
  // This function is designed to be called once on mount and then handle its own reconnections.
  const connectWebSocket = () => {
    // If a connection is already established or in progress, do nothing.
    if (stompClient.current && (stompClient.current.connected || (stompClient.current.ws && stompClient.current.ws.readyState === SockJS.CONNECTING))) {
      console.log(`WebSocket client for Chat is already connected or connecting. Current status: ${stompStatus}. Skipping new connection attempt.`);
      return;
    }

    // Clear any existing reconnect timeout before attempting a new connection
    if (reconnectTimeout.current) {
      clearTimeout(reconnectTimeout.current);
      reconnectTimeout.current = null;
    }

    console.log('Attempting to connect to WebSocket for Chat...');
    if (isMounted.current) {
      setStompStatus('connecting'); // Set status to connecting
      setMessageError('Connecting to chat...');
    }

    const socket = new SockJS('http://localhost:8080/ws');
    stompClient.current = Stomp.over(socket);

    const token = currentUser ? currentUser.token : null;
    const headers = {};
    if (token) {
      headers['Authorization'] = 'Bearer ' + token;
    }

    stompClient.current.connect(headers, () => {
      console.log('Connected to Chat WebSocket!');
      if (isMounted.current) {
        setStompStatus('connected');
        setMessageError('');
      }

      // Subscribe to the public chat topic
      setTimeout(() => {
        if (stompClient.current && stompClient.current.connected) {
          stompClient.current.subscribe('/topic/publicChat', (message) => {
            const receivedMessage = JSON.parse(message.body);
            console.log('Received chat message:', receivedMessage);
            if (isMounted.current) {
              setMessages(prevMessages => {
                // Prevent duplicate messages if the same message is sometimes received twice (e.g., during reconnects)
                if (receivedMessage.id && prevMessages.some(msg => msg.id === receivedMessage.id)) {
                  console.log("Duplicate message received (ID:", receivedMessage.id, "). Skipping.");
                  return prevMessages;
                }
                return [...prevMessages, receivedMessage];
              });
            }
          });

          // Send a message to the server that the user has joined
          setTimeout(() => {
            if (currentUser && stompClient.current && stompClient.current.connected) {
              stompClient.current.send(
                '/app/chat.addUser',
                {},
                JSON.stringify({ senderUsername: currentUser.username, chatRoomId: chatRoomId })
              );
            }
          }, 100);
        } else {
          console.error("STOMP client not connected for subscription/addUser after connect callback.");
          if (isMounted.current) {
            setMessageError('Chat connection unstable. Real-time chat may not work.');
            setStompStatus('disconnected');
          }
        }
      }, 100);
    }, (error) => {
      console.error('STOMP connection error:', error);
      if (isMounted.current) {
        setStompStatus('disconnected');
        setMessageError('Chat connection failed. Real-time chat unavailable. Retrying...');
      }
      // Schedule reconnection only if component is still mounted
      if (isMounted.current) {
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
      }
    });

    // Handle raw SockJS errors and close events
    socket.onclose = (event) => {
      console.log("SockJS connection closed for Chat:", event);
      // Only attempt reconnection if the component is still mounted and the status isn't already disconnected
      if (isMounted.current && stompStatus !== 'disconnected') {
        setStompStatus('disconnected');
        setMessageError('Chat connection closed. Real-time chat unavailable. Retrying...');
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
      }
    };

    socket.onerror = (error) => {
      console.error("SockJS error for Chat:", error);
      // Only attempt reconnection if the component is still mounted and the status isn't already disconnected
      if (isMounted.current && stompStatus !== 'disconnected') {
        setStompStatus('disconnected');
        setMessageError('Chat error. Real-time chat unavailable. Retrying...');
        reconnectTimeout.current = setTimeout(connectWebSocket, 3000);
      }
    };
  };

  // Main useEffect for component lifecycle
  useEffect(() => {
    isMounted.current = true; // Mark component as mounted

    // Fetch initial chat history
    chatService.getChatHistory(chatRoomId)
      .then(response => {
        if (isMounted.current) {
          setMessages(response.data);
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
          setMessageError('Error fetching chat history: ' + resMessage);
        }
        console.error('Error fetching chat history:', error);
      });

    // Initiate WebSocket connection
    // Use a small timeout to ensure the component is fully mounted before connecting
    const initialConnectTimer = setTimeout(() => {
      connectWebSocket();
    }, 50);

    // Cleanup function: disconnect WebSocket on component unmount
    return () => {
      console.log("ChatPage cleanup running...");
      isMounted.current = false; // Mark component as unmounted

      // Clear any pending reconnection timeouts
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
        reconnectTimeout.current = null;
      }
      // Clear the initial connect timer if it's still pending
      if (initialConnectTimer) {
        clearTimeout(initialConnectTimer);
      }

      if (stompClient.current) {
        // Check if STOMP client is connected before attempting disconnect
        if (stompClient.current.connected) {
          console.log('Disconnecting STOMP client for Chat.');
          stompClient.current.disconnect(() => {
            console.log('STOMP client disconnected callback for Chat.');
          });
        } else if (stompClient.current.ws && stompClient.current.ws.readyState === SockJS.OPEN) {
          // If STOMP client is not connected but the underlying SockJS is open, close it directly
          console.log('Closing underlying SockJS connection directly for Chat (SockJS OPEN).');
          stompClient.current.ws.close();
        } else {
          console.log('STOMP client not connected or SockJS not open. No explicit disconnect/close needed.');
        }
        stompClient.current = null; // Nullify the ref
      }
      // Reset status on unmount. This ensures a fresh start if the component remounts.
      // Do not use setStompStatus here directly as it might cause a state update on an unmounted component.
      // The initial state for remounted component will handle setting it to 'disconnected'.
    };
  }, []); // Empty dependency array: runs once on mount, once on unmount

  // Auto-scroll to the bottom of messages when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Handles sending a new chat message.
   * @param {Event} e - The form submission event.
   */
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '' || !currentUser || stompStatus !== 'connected' || !stompClient.current || !stompClient.current.connected) {
      setMessageError('Cannot send empty message or not connected to chat.');
      return;
    }
    setMessageError('');
    const chatMessage = {
      senderUsername: currentUser.username, // Sender's username
      messageText: newMessage.trim(),
      chatRoomId: chatRoomId,
      timestamp: new Date().toISOString() // Frontend timestamp, backend will override
    };

    try {
      stompClient.current.send('/app/chat.sendMessage', {}, JSON.stringify(chatMessage));
      setNewMessage(''); // Clear input field
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageError('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="p-6 rounded-lg shadow-lg flex flex-col h-[calc(100vh-120px)]" style={{ backgroundColor: '#2D3748' }}> {/* background-dark_lighter */}
      <h2 className="text-3xl font-bold mb-6 text-center" style={{ color: '#6366F1' }}> {/* primary */}
        Public Chat
      </h2>

      {messageError && (
        <div className="p-3 rounded-md mb-4 text-center text-white"
          style={{ backgroundColor: '#EF4444' }}> {/* error-red */}
          {messageError}
        </div>
      )}

      <div className="text-center mb-4" style={{ color: '#D1D5DB' }}> {/* text-dark_secondary */}
        Chat Status: <span className="font-semibold" style={{ color: stompStatus === 'connected' ? '#22C55E' : '#FBBF24' }}> {/* success-green or yellow-500 (approximated) */}
          {stompStatus === 'connected' ? 'Connected' : stompStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
        </span>
      </div>

      {/* Message Display Area */}
      <div className="flex-grow overflow-y-auto p-4 rounded-lg mb-4 custom-scrollbar"
        style={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }}> {/* background-dark, border-dark */}
        {messages.length > 0 ? (
          messages.map((msg) => ( // Removed 'index' from here
            <div key={msg.id} className="mb-2"> {/* ONLY use msg.id as key */}
              <span className="font-semibold mr-2" style={{ color: '#4F46E5' }}> {/* primary-dark */}
                {msg.senderUsername === currentUser?.username ? 'You' : msg.senderUsername}:
              </span>
              <span style={{ color: '#F9FAFB' }}>{msg.messageText}</span> {/* text-dark */}
              <span className="text-xs ml-2" style={{ color: '#D1D5DB' }}> {/* text-dark_secondary */}
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <p className="text-center" style={{ color: '#D1D5DB' }}>No messages yet. Start the conversation!</p>
        )}
        <div ref={messagesEndRef} /> {/* Scroll to this element */}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-4">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-grow px-4 py-2 rounded-md shadow-sm transition duration-200"
          style={{ border: '1px solid #4B5563', backgroundColor: '#374151', color: '#F9FAFB', outline: 'none' }} /* border-dark, background-light, text-dark */
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={stompStatus !== 'connected'} // Disable if not connected
        />
        <button
          type="submit"
          className="px-6 py-2 text-white rounded-md shadow-md transition duration-200"
          style={{ backgroundColor: '#6366F1' }} /* primary */
          disabled={stompStatus !== 'connected' || newMessage.trim() === ''} // Disable if not connected or message is empty
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage;