import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { INTERESTS } from './ProfileInterests';
import axiosInstance from '../../../../utils/axiosConfig';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import HeartLoader from '../../../loader/HeartLoader';


export default function ProfileForm({ isEditing, setIsEditing }) {

  const location = useLocation();

  useEffect(() => {
    if (location.state?.editMode) {
      setIsEditing(true);
    }
  }, [location.state, setIsEditing]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birth_date: new Date(),
    gender: '',
    gender_preferences: '',
    interests: [],
    location: {
      latitude: 0,
      longitude: 0,
      address: '',
    },
  });
  
  const [originalData, setOriginalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  const [changes, setChanges] = useState({});
  const [isProfileComplete, setIsProfileComplete] = useState(true);

  useEffect(() => {
    fetchUserProfile();

  }, []);

  useEffect(() => {
    if (originalData && isEditing) {
      const changedFields = {};
      Object.keys(formData).forEach(key => {
        if (key === 'birth_date') {
          if (new Date(originalData[key]).toISOString() !== new Date(formData[key]).toISOString()) {
            changedFields[key] = formData[key];
          }
        } else if (key === 'interests') {
          if (JSON.stringify(originalData[key]) !== JSON.stringify(formData[key])) {
            changedFields[key] = formData[key];
          }
        } else if (key === 'location') {
          if (JSON.stringify(originalData[key]) !== JSON.stringify(formData[key])) {
            changedFields[key] = formData[key];
          }
        } else if (originalData[key] !== formData[key]) {
          changedFields[key] = formData[key];
        }
      });
      setChanges(changedFields);
    }
  }, [formData, originalData, isEditing]);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get('users/user-profile/');
      const { username, email, is_profile_updated, ...profileData } = response.data;
  
      const formattedData = {
        name: username,
        email,
        ...profileData,
        birth_date: profileData.birth_date ? new Date(profileData.birth_date) : new Date(),
      };
      
      setFormData(formattedData);
      setOriginalData(formattedData);
      if (response.data.last_updated_at) {
        setLastUpdated(response.data.last_updated_at);
      }
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 403) {
        // Log the error response to see what we're getting
        console.log("403 error response data:", error.response.data);
        
        // Properly destructure the error response data
        const { username, email, is_profile_updated} = error.response.data;
        
        // Set the form data with the received username and email
        const userData = {
          name: username,  // Make sure to use 'name' since that's what your formData expects
          email,
          birth_date: new Date(),
          gender: '',
          gender_preferences: '',
          interests: [],
          location: {
            latitude: 0,
            longitude: 0,
            address: '',
          },
        };
        
        setFormData(userData);
        setOriginalData(userData);
        setIsProfileComplete(false);
        setIsEditing(true);
        setError('Please complete your profile');
        setTimeout(() => setLoading(false), 1000);
      } else if (error.response?.status === 404) {
        setError('Profile not found');
      }
      // else if(error.response?.status === 400 && ){} 
      else {
        setError('Failed to load profile');
      }
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const submitData = {
        ...changes,
        birth_date: formData.birth_date.toISOString().split('T')[0],
      };

      let response;
      if (!lastUpdated) {
        // Create new profile
        response = await axiosInstance.post('users/set-user-profile/', submitData);
      } else {
        // Update existing profile
        response = await axiosInstance.patch('users/update-user-profile/', submitData);
      }

      setOriginalData({ ...formData });
      setChanges({});
      setLastUpdated(response.data.last_updated_at);
      setIsEditing(false);

      // Optional: Show success message
      toast.success('Profile updated successfully!');
    } catch (error) {
      setError(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to save profile'
      );
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCancel = () => {
    setFormData({ ...originalData });
    setChanges({});
    setIsEditing(false);
  };

  const getCurrentLocation = () => {
    if (!isEditing) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            // address: formData.location.address // Maintain existing address
          };
          handleFieldChange('location', newLocation);
        },
        (error) => {
          setError('Failed to get location: ' + error.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };


  return (
    <form onSubmit={handleSubmit} className="m-10">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-sm text-gray-500">
            {lastUpdated && `Last updated: ${lastUpdated}`}
          </div>
          {isEditing && Object.keys(changes).length > 0 && (
            <div className="text-sm text-blue-500 mt-1">
              {Object.keys(changes).length} field(s) modified
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isEditing 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-4 py-2 leading-tight"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 px-4 py-2 leading-tight"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
          <DatePicker
            selected={formData.birth_date}
            onChange={(date) => handleFieldChange('birth_date', date || new Date())}
            dateFormat="dd/MM/yyyy"
            showYearDropdown
            yearDropdownItemNumber={100} // Show 100 years in the dropdown
            scrollableYearDropdown // Enable scrolling in the dropdown
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:border-blue-500 focus:ring-blue-500 px-4 py-2 leading-tight"
          />
          {isEditing && changes.birth_date && (
            <span className="text-xs text-blue-500 mt-1">Modified</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender}
            onChange={(e) => handleFieldChange('gender', e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:border-blue-500 focus:ring-blue-500 px-4 py-2 leading-tight"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {isEditing && changes.gender && (
            <span className="text-xs text-blue-500 mt-1">Modified</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender Preference</label>
          <select
            value={formData.gender_preferences}
            onChange={(e) => handleFieldChange('gender_preferences', e.target.value)}
            disabled={!isEditing}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 focus:border-blue-500 focus:ring-blue-500 px-4 py-2 leading-tight"
          >
            <option value="">Select Preference</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="bi">Bi</option>
          </select>
          {isEditing && changes.gender_preferences && (
            <span className="text-xs text-blue-500 mt-1">Modified</span>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
          <div className="space-y-2">
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={!isEditing}
              className={`w-full px-4 py-2 text-sm font-medium rounded-md ${
                isEditing
                  ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              Get Current Location
            </button>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.location.latitude}
                readOnly
                placeholder="Latitude"
                className="rounded-md border-gray-300 shadow-sm bg-gray-50 px-4 py-2"
              />
              <input
                type="text"
                value={formData.location.longitude}
                readOnly
                placeholder="Longitude"
                className="rounded-md border-gray-300 shadow-sm bg-gray-50 px-4 py-2"
              />
            </div>
          </div>
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
                  handleFieldChange('interests', newInterests);
                }}
                className={`px-3 py-1 rounded-full text-sm ${
                  formData.interests?.includes(interest)
                    ? 'bg-yellow-200 text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!isEditing && 'cursor-default'}`}
              >
                {interest}
              </button>
            ))}
          </div>
          {isEditing && (
            <>
              {changes.interests && (
                <span className="text-xs text-blue-500 mt-1 block">Modified</span>
              )}
              {formData.interests?.length < 10 && (
                <p className="text-sm text-red-500 mt-2">
                  Please select at least 10 interests
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            disabled={formData.interests?.length < 10 || Object.keys(changes).length === 0}
          >
            Save Changes
          </button>
        </div>
      )}
    </form>
  );
}