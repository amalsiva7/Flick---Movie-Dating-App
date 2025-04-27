import React, { useState } from "react";
import { Heart, MessageCircle, User } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import NotificationIcon from "./userheaderComponents/NotificationIcon";
import { useSelector } from "react-redux";
import FlickIcon from "./userheaderComponents/FlickIcon";
import MessageIcon from "./userheaderComponents/MesssageIcon";

const UserHomeHeader = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const username = useSelector((state) => state.authentication_user.username);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.reload();
    toast.loading("Logging out...");
  };

  return (
    <div className="relative flex items-center justify-between px-4 py-2 bg-white shadow-sm">
      {/* Left icons (Hamburger and Zap) */}
      <h1 className="text-xl font-bold text-gray-800">#Flick</h1>

      {/* Right icons (FlickIcon, Notification, Messages, User) */}
      <div className="flex items-center gap-20 relative">
        <FlickIcon />
        <NotificationIcon />
        <MessageIcon/>


        <div className="relative">
          {/* User icon with dropdown toggle */}
          <User
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-purple-500 transition-colors"
            onClick={toggleDropdown}
          />

          {/* Dropdown menu */}
          {isDropdownOpen && (
            
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-32 z-50 flex flex-col items-center py-2">
              {/* Username Display */}
              {username && (
                <span className=" text-gray-700 text-sm font-bold mb-2">
                  Hi, {username}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="block w-full px-3 py-2 text-center text-gray-700 hover:bg-gray-100 text-sm"
              >
                Logout
              </button>
            </div>

          )}
        </div>
      </div>
    </div>
  );
};

export default UserHomeHeader;
