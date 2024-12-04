import React, { useState } from 'react';
import { Heart, MessageCircle, User, Zap } from 'lucide-react';
import { FaHamburger } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.reload();
    toast.loading("logging out")
  };

  return (
    <div className="relative flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      {/* Left icons (Hamburger and Zap) */}
      <div className="flex gap-10">
      <h2 className="text-black text-lg font-semibold mb-1">Admin Panel</h2>
      </div>

      {/* Center title */}
      <h1 className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-gray-800">
        #Flick
      </h1>

      {/* Right icons (Heart, MessageCircle, User) */}
      <div className="flex items-center gap-20 relative">
        <div className="relative">
          {/* User icon with dropdown toggle */}
          <User
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-purple-500 transition-colors"
            onClick={toggleDropdown}
          />

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-lg w-40">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
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

export default AdminHeader;
