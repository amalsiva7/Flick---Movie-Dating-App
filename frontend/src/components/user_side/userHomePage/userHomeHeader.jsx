import React, { useState } from 'react';
import { Heart, MessageCircle, User, Zap } from 'lucide-react';
import { FaHamburger } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const UserHomeHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate()

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
  
 
  const navigateToProfile = () => {
    navigate('/user-profile');
  };

  return (
    <div className="relative flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      {/* Left icons (Hamburger and Zap) */}
      <div className="flex gap-10">
        <FaHamburger className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500 transition-colors" />
        <Zap className="w-6 h-6 text-yellow-500" />
      </div>

      {/* Center title */}
      <h1 className=" text-2xl font-bold text-gray-800">#Flick</h1>

      {/* Right icons (Heart, MessageCircle, User) */}
      <div className="flex items-center gap-20 relative">
        <Heart className="w-6 h-6 text-gray-600 cursor-pointer hover:text-red-500 transition-colors" />
        <MessageCircle className="w-6 h-6 text-gray-600 cursor-pointer hover:text-blue-500 transition-colors" />
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
              <button className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100"
              onClick={navigateToProfile}>
                Profile
              </button>
            </div>
            
          )}
        </div>
      </div>
    </div>
  );
};

export default UserHomeHeader;
