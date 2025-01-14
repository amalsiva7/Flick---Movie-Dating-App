import React, { useEffect, useState } from 'react'
import ProfileHeader from './userprofileComponents/UserProfileHeader';
import TabButtons from './userprofileComponents/TabButtons';
import ProfileForm from './userprofileComponents/ProfileForm';
import HeartLoader from '../../loader/HeartLoader';
import UserProfilePic from './userprofileComponents/UserProfilePic';


const UserProfile =()=> {

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('entered to user profile');

    // Simulate a delay for the loader
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 500); 

    return () => {
      console.log('user profile unmounted');
      clearTimeout(timeout); // Cleanup timeout to avoid memory leaks
    };
  }, []);
  if (loading) {
    return (
      <div className="relative bg-white shadow-md rounded-lg border p-4 h-full w-3/4 left-32 flex justify-center items-center">
        <HeartLoader/>
      </div>
    );
  }
  return (
    <div className="h-auto bg-white relative shadow-lg rounded-lg border">
      <div className="flex justify-between items-center">
        <ProfileHeader />
        <TabButtons 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsEditing={setIsEditing}
          />
      </div>
      <div>
        {activeTab ==="profile" ? (<ProfileForm isEditing={isEditing} setIsEditing={setIsEditing}/>):(<UserProfilePic/>)}
      </div>
        
          
        
        

        
    </div>
  )
}

export default UserProfile;