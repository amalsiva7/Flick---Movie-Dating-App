import { MessageCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const MessageIcon = () => {
  const navigate = useNavigate();
  const { id: userId } = useSelector((state) => state.authentication_user);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNavigateToChat = () => {
    navigate('chat'); // Navigate to Chat page
    setUnreadCount(0); // Reset unread count when navigating
    localStorage.setItem('lastSeenChat', new Date().toISOString()); // Update last seen timestamp
  };

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('access');
    const socket = new WebSocket(`ws://localhost:8000/ws/chat_notifications/${userId}/?token=${token}`);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'new_message_notification') {
        const lastSeenTimestamp = localStorage.getItem('lastSeenChat') || null;

        // Count only new messages based on timestamp
        const newMessagesCount = lastSeenTimestamp
          ? data.messages.filter(
              (message) => new Date(message.created_at) > new Date(lastSeenTimestamp)
            ).length
          : data.messages.length;

        setUnreadCount((prevCount) => prevCount + newMessagesCount);
      }
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    return () => {
      socket.close();
    };
  }, [userId]);

  return (
    <div className="relative">
      <button
        onClick={handleNavigateToChat}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center focus:outline-none"
        aria-label="Navigate to Chat page"
      >
        <MessageCircle className="w-6 h-6 text-blue-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default MessageIcon;
