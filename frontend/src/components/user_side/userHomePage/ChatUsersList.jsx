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

  const goToChat = (chatRoomId) => {
    navigate(`/dm-chat/${chatRoomId}`);
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
                      e.target.onerror = null; // Prevent infinite loop
                      e.target.src = "/default-profile.png";
                    }}
                  />
                  <div>
                    <div className="font-semibold text-gray-800">{user.username || "Unknown User"}</div>
                    <div className="text-xs text-gray-500">Last seen: {user.last_seen}</div>
                  </div>
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
