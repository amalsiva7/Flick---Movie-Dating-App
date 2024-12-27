import React, { useEffect, useState } from 'react'
import ProfileHeader from './userprofileComponents/UserProfileHeader';
import TabButtons from './userprofileComponents/TabButtons';
import ProfileForm from './userprofileComponents/ProfileForm';


const UserProfile =()=> {

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);

useEffect(()=>{
 console.log('ebtered ti user profile')

 return (
  console.log('user rofile unmounted')
 )
},[])
  return (
    <div className="h-screen bg-white relative shadow-lg rounded-lg border">
      <div className="w-1/4 p-5">
        <ProfileHeader />
      </div>
      <div className='mt-5 flex justify-end'>
          <TabButtons 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setIsEditing={setIsEditing}
          />
        </div>
      <div className='mb'>
        {activeTab ==="profile" ? (<ProfileForm isEditing={isEditing} setIsEditing={setIsEditing}/>):'false'}
      </div>
        
          
        
        

        
    </div>
  )
}

export default UserProfile;