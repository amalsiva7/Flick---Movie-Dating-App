import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import axiosInstance from "../../../../utils/axiosConfig";

const NotificationIcon = () => {
  const { id: userId } = useSelector((state) => state.authentication_user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log("User Id in NotificationIcon",userId)
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`users/notifications/${userId}/`);
        const allNotifications = response.data.notifications;

        const lastSeenTimestamp = localStorage.getItem("lastSeenNotification") || null;
        const newUnreadCount = lastSeenTimestamp
          ? allNotifications.filter(n => !n.read && new Date(n.timestamp) > new Date(lastSeenTimestamp)).length
          : response.data.unread_count;

        setNotifications(allNotifications);
        setUnreadCount(newUnreadCount);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();

    const token = localStorage.getItem("access"); // Retrieve JWT token from local storage

    console.log("token from local storage in NotificationIcon",token)

    const websocketUrl = `ws://localhost:8000/ws/notifications/${userId}/?token=${token}`;
    const ws = new WebSocket(websocketUrl);



    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setSocket(ws);
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        if (data.type === 'notification') {
          setNotifications(prev => [
            { id: data.message.id, message: data.message.message, read: false, timestamp: data.message.timestamp },
            ...prev,
          ]);
          setUnreadCount(prev => prev + 1);
        } else if (data.type === 'previous_notifications') {
          setNotifications(data.notifications);
          const unreadCount = data.notifications.filter(n => !n.read).length;
          setUnreadCount(unreadCount);

          const latestUnread = data.notifications.find(n => !n.read);
          if (latestUnread) localStorage.setItem("lastSeenNotification", latestUnread.timestamp);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    return () => ws.close();
  }, [userId]);

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      axiosInstance.post(`users/notifications/${userId}/mark-as-read/`)
        .then(() => setUnreadCount(0))
        .catch(error => console.error('Error marking notifications as read:', error));
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
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

      {isOpen && (
        <div className="fixed top-16 right-5 w-80 bg-white rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center">No notifications</p>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-3 rounded-lg bg-blue-50">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationIcon;
