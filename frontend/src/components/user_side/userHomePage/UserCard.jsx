import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../userProfile/userprofileComponents/ProfileForm";
import axiosInstance from "../../../utils/axiosConfig";


const UserCard = () => {
  const [hasProfile, setHasProfile] = useState(false);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserProfile();
  }, []);
  

  const checkUserProfile = async () => {
    try {
      const response = await axiosInstance.get('users/user-profile/');
      setHasProfile(true);
      setIsProfileUpdated(response.data.is_profile_updated);
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
      } else if (error.response?.status === 403) {
        setHasProfile(true);
        setIsProfileUpdated(false);
      }
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    navigate('/user/profile', { state: { editMode: true } });
  };

  if (loading) {
    return (
      <div className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32 flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32">
      {!hasProfile ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-64">
          <h1 className="text-2xl font-semibold text-gray-800">Welcome to Your Dating Journey!</h1>
          <p className="text-gray-600 text-center max-w-md">
            Create your profile to start connecting with amazing people and discover meaningful relationships.
          </p>
          <button
            onClick={handleCreateProfile}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Create Your Profile Now
          </button>
        </div>
      ) : !isProfileUpdated ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-64">
          <h1 className="text-2xl font-semibold text-gray-800">Complete Your Profile</h1>
          <p className="text-gray-600 text-center max-w-md">
            Please complete your profile to access all features.
          </p>
          <button
            onClick={handleCreateProfile}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200"
          >
            Complete Profile
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Your Profile</h1>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-lg font-medium transition-colors bg-blue-100 text-blue-600 hover:bg-blue-200"
            >
              Edit
            </button>
          </div>
          <ProfileForm isEditing={isEditing} setIsEditing={setIsEditing} />
        </div>
      )}
    </div>
  );
};

export default UserCard;