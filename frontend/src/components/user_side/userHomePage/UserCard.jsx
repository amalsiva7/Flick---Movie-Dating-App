import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProfileForm from "../userProfile/userprofileComponents/ProfileForm";
import axiosInstance from "../../../utils/axiosConfig";
import HeartLoader from "../../loader/HeartLoader";
import DatingCard from "../userdatecard/DatingCard";


const UserCard = () => {
  const [hasProfile, setHasProfile] = useState(false);
  const [isProfileUpdated, setIsProfileUpdated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // Websocket
  const[socket,setSocket] = useState(null);
  const[notification,setNotification] = useState([])

  

  useEffect(() => {
    checkUserProfile();
  }, []);
  

  const checkUserProfile = async () => {
    try {
      const response = await axiosInstance.get('users/user-profile/');
      setHasProfile(true);
      setIsProfileUpdated(response.data.is_profile_updated);
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      if (error.response?.status === 404) {
        setHasProfile(false);
      } else if (error.response?.status === 403) {
        setHasProfile(true);
        setIsProfileUpdated(false);
      }
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleCreateProfile = () => {
    navigate('/user/profile', { state: { editMode: true } });
  };

  if (loading) {
    return (
      <div className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32 flex justify-center items-center">
        <HeartLoader/>
      </div>
    );
  }

  if (isProfileUpdated) {
    return <DatingCard />;
  }

  return (
    <div className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32 flex justify-center items-center">
      {!hasProfile ? (
        <div className="flex flex-col items-center justify-center space-y-4 h-64">
          <h1 className="text-2xl font-semibold text-gray-800">
            Welcome to Your Dating Journey!
          </h1>
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
      ) : (
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
      )}
    </div>
  );
};

export default UserCard;