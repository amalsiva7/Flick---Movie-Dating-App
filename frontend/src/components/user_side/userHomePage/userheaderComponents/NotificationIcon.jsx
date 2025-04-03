// import React, { useEffect, useState } from 'react';
// import { useSelector } from 'react-redux';
// import { Heart } from 'lucide-react';
// import axiosInstance from "../../../../utils/axiosConfig";

// const NotificationIcon = () => {
//   const { id: userId } = useSelector((state) => state.authentication_user);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [socket, setSocket] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);

//   useEffect(() => {
//     if (!userId) return;
  
//     const fetchNotifications = async () => {
//       try {
//         const response = await axiosInstance.get(`users/notifications/${userId}/`);
//         const allNotifications = response.data.notifications;
  
//         // Retrieve last seen timestamp from local storage
//         const lastSeenTimestamp = localStorage.getItem("lastSeenNotification") || null;
  
//         // Filter new notifications after last seen timestamp
//         const newUnreadCount = lastSeenTimestamp
//           ? allNotifications.filter(n => !n.read && new Date(n.timestamp) > new Date(lastSeenTimestamp)).length
//           : response.data.unread_count;
  
//         setNotifications(allNotifications);
//         setUnreadCount(newUnreadCount);
//       } catch (error) {
//         console.error('Error fetching notifications:', error);
//       }
//     };
  
//     fetchNotifications();
  
//     const websocketUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
//     const ws = new WebSocket(websocketUrl);
  
//     ws.onopen = () => {
//       console.log('Connected to WebSocket');
//       console.log(userId,"userid in notificationicon ws On Open")
//       setSocket(ws);
//     };
  
//     ws.onmessage = (e) => {
//       try {
//         const data = JSON.parse(e.data);
//         console.log("Received data:", data);
  
//         if (data.type === 'notification') {
//           setNotifications(prev => [{ 
//             id: data.message.id, 
//             message: data.message.message, 
//             is_read: false 
//           }, ...prev]);          
//           setUnreadCount(prev => prev + 1);
//         } else if (data.type === 'previous_notifications') {
//           setNotifications(data.notifications);
  
//           // Use the timestamp of the latest unread notification
//           const latestUnread = data.notifications.find(n => !n.read);
//           if (latestUnread) {
//             localStorage.setItem("lastSeenNotification", latestUnread.timestamp);
//           }
  
//           setUnreadCount(data.notifications.filter(n => !n.read).length);
//         }
//       } catch (error) {
//         console.error('Error parsing WebSocket message:', error);
//       }
//     };
  
//     ws.onclose = () => {
//       console.log('WebSocket disconnected');
//       setSocket(null);
//     };
  
//     return () => {
//       if (ws) ws.close();
//     };
//   }, [userId]);
  

//   useEffect(() => {
//     if (isOpen && unreadCount > 0) {
//       axiosInstance.post(`users/notifications/${userId}/mark-as-read/`)
//         .then(() => setUnreadCount(0))
//         .catch(error => console.error('Error marking notifications as read:', error));
//     }
//   }, [isOpen]);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="relative p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
//         aria-label="View notifications"
//       >
//         <Heart className="h-6 w-6" />
//         {unreadCount > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//             {unreadCount}
//           </span>
//         )}
//       </button>

//       {isOpen && (
//         <div className="fixed top-16 right-5 w-80 bg-white rounded-lg shadow-lg z-40 max-h-96 overflow-y-auto">
//           <div className="p-4">
//             <h3 className="text-lg font-semibold mb-4">Notifications</h3>
//             {notifications.length === 0 ? (
//               <p className="text-gray-500 text-center">No notifications</p>
//             ) : (
//               <div className="space-y-4">
//                 {notifications.map((notification) => (
//                   <div key={notification.id} className="p-3 rounded-lg bg-blue-50">
//                     <p className="text-sm">{notification.message}</p>
//                     <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationIcon;


import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Heart } from 'lucide-react';
import axiosInstance from "../../../../utils/axiosConfig";

const NotificationIcon = () => {
  const { id: userId, token } = useSelector((state) => state.authentication_user);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!userId || !token) return;
  
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get(`users/notifications/${userId}/`);
        const allNotifications = response.data.notifications;
  
        // Retrieve last seen timestamp from local storage
        const lastSeenTimestamp = localStorage.getItem("lastSeenNotification") || null;
  
        // Filter new notifications after last seen timestamp
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
  
    // Include authentication token in WebSocket URL or connect with proper headers
    const websocketUrl = `ws://localhost:8000/ws/notifications/${userId}/`;
    const ws = new WebSocket(websocketUrl);
    
    // Set Authorization header for WebSocket
    ws.onopen = () => {
      console.log('Connected to WebSocket');
      // Send auth token immediately after connection
      ws.send(JSON.stringify({
        type: 'authentication',
        token: token
      }));
      setSocket(ws);
    };
  
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("Received data:", data);
  
        if (data.type === 'notification') {
          console.log("Adding new notification:", data.message);
          
          // Format the notification properly
          const newNotification = {
            id: data.message.id,
            message: data.message.message,
            read: false,
            timestamp: data.message.timestamp
          };
          
          // Add to notifications list and update count
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
        } else if (data.type === 'previous_notifications') {
          setNotifications(data.notifications);
  
          // Use the timestamp of the latest unread notification
          const latestUnread = data.notifications.find(n => !n.read);
          if (latestUnread) {
            localStorage.setItem("lastSeenNotification", latestUnread.timestamp);
          }
  
          setUnreadCount(data.notifications.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  
    ws.onclose = (e) => {
      console.log('WebSocket disconnected:', e.code, e.reason);
      setSocket(null);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  
    return () => {
      if (ws) ws.close();
    };
  }, [userId, token]);
  

  useEffect(() => {
    if (isOpen && unreadCount > 0) {
      axiosInstance.post(`users/notifications/${userId}/mark-as-read/`)
        .then(() => {
          setUnreadCount(0);
          // Update the read status of all notifications
          setNotifications(prev => 
            prev.map(notification => ({...notification, read: true}))
          );
          // Update the last seen timestamp
          if (notifications.length > 0) {
            localStorage.setItem("lastSeenNotification", new Date().toISOString());
          }
        })
        .catch(error => console.error('Error marking notifications as read:', error));
    }
  }, [isOpen, userId, unreadCount]);

  const formatTimestamp = (timestamp) => {
    // Format timestamp for display
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

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
                  <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatTimestamp(notification.timestamp)}</p>
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