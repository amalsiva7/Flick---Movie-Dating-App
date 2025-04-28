import React from "react";
import { Phone, Video } from "lucide-react";

const ChatHeader = ({ user }) => {
  if (!user) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm rounded-t-lg">
      <div className="flex items-center gap-3">
        <img
          src={`http://localhost:8000${user.profile_image}`}
          alt={user.username || "User profile"}
          className="w-10 h-10 rounded-full object-cover border"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-profile.png";
          }}
        />
        <span className="font-semibold text-gray-800">{user.username || "Unknown User"}</span>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition" title="Voice Call" type="button">
          <Phone size={22} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition" title="Video Call" type="button">
          <Video size={22} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
