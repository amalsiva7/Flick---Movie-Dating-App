import React from "react";
import { Phone, Video } from "lucide-react";
import Skeleton from 'react-loading-skeleton'; // Install this package

const ChatHeader = ({ user }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b bg-white shadow-sm rounded-t-lg">
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <img
              src={`http://localhost:8000${user.profile_image}` || "/default-profile.png"}
              alt={user.username}
              className="w-10 h-10 rounded-full object-cover border"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/default-profile.png";
              }}
            />
            <span className="font-semibold text-gray-800">
              {user.username}
            </span>
          </>
        ) : (
          <>
            <Skeleton circle width={40} height={40} />
            <Skeleton width={100} height={20} />
          </>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 transition" 
                title="Voice Call" 
                type="button">
          <Phone size={22} />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-100 transition" 
                title="Video Call" 
                type="button">
          <Video size={22} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;