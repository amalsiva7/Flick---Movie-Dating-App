import React from 'react';

export default function ProfileHeader() {
  return (
    <div className="flex flex-col items-start m-5">
      <div className="w-12 h-12 rounded-full overflow-hidden mb-4">
        <img
          src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=128&h=128"
          alt="Profile"
          className="w-full h-full object-cover"
        />
      </div>
      <h1 className="text-2xl font-bold">Profile Settings</h1>
    </div>
  );
}