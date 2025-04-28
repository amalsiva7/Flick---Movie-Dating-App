import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../utils/axiosConfig";

const ChatUserList = () => {
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMatchedUsers = async () => {
      try {
        const token = localStorage.getItem("access");
        const response = await axiosInstance.get("/dm_chat/matched_users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMatchedUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch matched users:", error);
        setError("Failed to load matched users.");
      }
    };

    fetchMatchedUsers();
  }, []);

  const goToChat = async (chatRoomId) => {
    try {
      const token = localStorage.getItem("access");

      // Call backend to mark messages as read
      await axiosInstance.post(
        `/dm_chat/mark_read/${chatRoomId}/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update unread count locally to 0 for this chat room
      setMatchedUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.chat_room_id === chatRoomId
            ? { ...user, unread_message_count: 0 }
            : user
        )
      );

      // Navigate to chat room
      navigate(`/user/dm-chat/${chatRoomId}`);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
      // Navigate anyway even if marking read fails
      navigate(`/user/dm-chat/${chatRoomId}`);
    }
  };

  return (
    <div className="h-full bg-white relative shadow-md rounded-lg">
      <div className="p-2.5 rounded-lg">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold mb-4">Chats</h2>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          {matchedUsers.length === 0 && !error ? (
            <div className="text-gray-500">No matched users found.</div>
          ) : (
            <ul>
              {matchedUsers.map((user) => (
                <li
                  key={user.id}
                  className="flex items-center gap-4 mb-4 p-2 rounded hover:bg-gray-100 cursor-pointer"
                  onClick={() => goToChat(user.chat_room_id)}
                >
                  <img
                    src={`http://localhost:8000${user.profile_image}`}
                    alt={user.username || "User profile"}
                    className="w-12 h-12 rounded-full object-cover border"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/default-profile.png";
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {user.username || "Unknown User"}
                    </div>
                    <div className="text-xs text-gray-500 flex justify-between">
                      <span>{user.last_message_time}</span>
                    </div>
                    <div className="text-sm text-gray-700 truncate">
                      {user.last_message || "No messages yet"}
                    </div>
                  </div>
                  {user.unread_message_count > 0 && (
                    <div className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {user.unread_message_count}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatUserList;
