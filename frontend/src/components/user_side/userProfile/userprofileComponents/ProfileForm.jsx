import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { INTERESTS } from './ProfileInterests';


export default function ProfileForm({ isEditing, setIsEditing }) {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    genderPreference: 'bisexual',
    interests: [],
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Implement form submission
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleSubmit} className='m-10'>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="text-blue-600 hover:text-blue-700"
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 ">Name</label>
          <input
            type="text"
            value={formData.name}
            readOnly={!isEditing}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="mt-1 block w-auto rounded-md border-gray-300 shadow-sm bg-gray-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <DatePicker
            selected={formData.dateOfBirth}
            onChange={(date) => setFormData({ ...formData, dateOfBirth: date || new Date() })}
            dateFormat="dd/MM/yyyy"
            disabled={!isEditing}
            className="mt-1 block w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
            disabled={!isEditing}
            className="mt-1 block w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender Preference</label>
          <select
            value={formData.genderPreference}
            onChange={(e) => setFormData({ ...formData, genderPreference: e.target.value })}
            disabled={!isEditing}
            className="mt-1 block w-auto rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="bisexual">Bisexual</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Interests</label>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => {
                  if (!isEditing) return;
                  const interests = formData.interests || [];
                  const newInterests = interests.includes(interest)
                    ? interests.filter((i) => i !== interest)
                    : [...interests, interest];
                  setFormData({ ...formData, interests: newInterests });
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.interests?.includes(interest)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!isEditing && 'cursor-default'}`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}
