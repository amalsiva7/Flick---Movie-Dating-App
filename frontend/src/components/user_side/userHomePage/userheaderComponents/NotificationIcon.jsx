import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationIcon = () => {
  const { id: userId } = useSelector((state) => state.authentication_user);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null); // Add socket to state
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  useEffect(()=>{
    console.log("useEffect in Notification Icon works")
    console.log(userId,": userID loggined")
  },[userId])

  useEffect(() => {
    if (!userId) return;

    const websocketUrl = `ws://localhost:8000/ws/notifications/${userId}/`;

    const connectWebSocket = () => {
      const ws = new WebSocket(websocketUrl);

      ws.onopen = () => {
        console.log('Connected to notifications socket');
        setSocket(ws); // Store the socket in state
        setReconnectAttempts(0); // Reset attempts
      };

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          console.log("Received data:", data);

          if (data.type === 'notification') {
            setUnreadCount((prev) => prev + 1);
          } else if (data.type === 'unread_count') {
            setUnreadCount(data.count);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (e) => {
        console.log('WebSocket disconnected:', e.reason);
        setSocket(null); // Clear the socket from state
        if (reconnectAttempts < maxReconnectAttempts) {
          setTimeout(() => {
            console.log('Attempting to reconnect...');
            setReconnectAttempts((prev) => prev + 1);
            connectWebSocket();
          }, 3000);
        } else {
          console.log('Max reconnect attempts reached.');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        ws.close(); // Ensure onClose is called
      };
    };

    connectWebSocket();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [userId]);

  const handleNotificationClick = () => {
    //optimistically reset the unread count
    setUnreadCount(0);
    navigate('/notifications');
  }


  return (
    <div className="relative">
      <button
        onClick={handleNotificationClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
        aria-label="View notifications"
      >
        <Heart className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default NotificationIcon;
