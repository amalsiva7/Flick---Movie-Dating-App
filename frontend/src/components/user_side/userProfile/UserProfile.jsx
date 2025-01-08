import React, { useEffect, useState } from 'react'
import ProfileHeader from './userprofileComponents/UserProfileHeader';
import TabButtons from './userprofileComponents/TabButtons';
import ProfileForm from './userprofileComponents/ProfileForm';


const UserProfile =()=> {

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

useEffect(()=>{
 console.log('entered to user profile')

 return (
  console.log('user profile unmounted')
 )
},[])
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
        {activeTab ==="profile" ? (<ProfileForm isEditing={isEditing} setIsEditing={setIsEditing}/>):'false'}
      </div>
        
          
        
        

        
    </div>
  )
}

export default UserProfile;