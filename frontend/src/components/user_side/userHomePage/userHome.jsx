import React from 'react'
import UserHomeHeader from './userHomeHeader';
import { Outlet } from 'react-router-dom';

const UserHome = () =>{

  return (
    <>
    <UserHomeHeader/>
    <Outlet/>

    </>
  )
}

export default UserHome;