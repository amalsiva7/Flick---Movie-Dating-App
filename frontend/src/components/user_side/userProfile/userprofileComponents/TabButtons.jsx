import React from 'react';
import { Pencil, Image } from 'lucide-react';

export default function TabButtons({ activeTab, setActiveTab, setIsEditing }) {
  return (
    <div className="flex gap-4 w-full max-w-md mx-auto">
      <button
        onClick={() => {
          setActiveTab('profile');
          setIsEditing(false);
        }}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'profile'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Pencil size={20} />
        <span>View/Edit Profile</span>
      </button>
      
      <button
        onClick={() => setActiveTab('pictures')}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          activeTab === 'pictures'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 hover:bg-gray-200'
        }`}
      >
        <Image size={20} />
        <span>Upload Pictures</span>
      </button>
    </div>
  );
}