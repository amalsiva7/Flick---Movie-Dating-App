import React from 'react'
import UserHomeHeader from './userHomeHeader';
import { Outlet } from 'react-router-dom';
import UserCard from './UserCard';

const UserHome = () =>{

  return (
    <>
    <UserHomeHeader/>
    <div className="flex items-center justify-center min-h-screen">
      <UserCard/>
    </div>
    
    <Outlet/>

    </>
  )
}

export default UserHome;