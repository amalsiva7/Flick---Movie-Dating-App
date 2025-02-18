import { MessageCircleHeart, Sparkles, Zap } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const FlickIcon = () => {
  const navigate = useNavigate();

  const handleNavigateToFlick = () => {
    navigate('flick'); // Update this path to match your actual flick page route
  };

  return (
    <div>
      <button
        onClick={handleNavigateToFlick}
        className="p-1 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center focus:outline-none focus:ring- focus:ring-yellow-400"
        aria-label="Navigate to Flick page"
      >
        <Zap className="w-6 h-6 text-yellow-500" />
      </button>
    </div>
  );
};

export default FlickIcon;