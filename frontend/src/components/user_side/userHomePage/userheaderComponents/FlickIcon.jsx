import { Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const FlickIcon = () => {
  const navigate = useNavigate();
  const { id: userId } = useSelector((state) => state.authentication_user);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleNavigateToFlick = () => {
    navigate('flick'); // Navigate to Flick page
    setUnreadCount(0); // Reset unread count when navigating
    localStorage.setItem('lastSeenFlick', new Date().toISOString()); // Update last seen timestamp
  };

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem('access');
    const socket = new WebSocket(`ws://localhost:8000/ws/answers/${userId}/?token=${token}`);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'flick_answer') {
        const lastSeenTimestamp = localStorage.getItem('lastSeenFlick') || null;

        // Count only new answers based on timestamp
        const newAnswersCount = lastSeenTimestamp
          ? data.answers.filter(
              (answer) => new Date(answer.created_at) > new Date(lastSeenTimestamp)
            ).length
          : data.answers.length;

        setUnreadCount((prevCount) => prevCount + newAnswersCount);
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
        onClick={handleNavigateToFlick}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center focus:outline-none"
        aria-label="Navigate to Flick page"
      >
        <Zap className="w-6 h-6 text-yellow-500" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FlickIcon;
