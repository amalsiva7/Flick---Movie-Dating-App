import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRoutes } from 'react-router-dom';
import HomePage from '../../pages/homePage';
import UserRegister from '../user_side/auth/userRegister';
import OTP from '../user_side/auth/OTP';

const UserWrapper = () => {
  const authentication_user = useSelector((state) => state.authentication_user);
  const dispatch = useDispatch();

  const checkAuth = async () => {
    const isAuthenticated = await isAuthUser();
    dispatch(
        setAuthentication({
            id: isAuthenticated.id,
            username: isAuthenticated.name,
            isAuthenticated: isAuthenticated.isAuthenticated,
            isAdmin: isAuthenticated.isAdmin,
        })
    );
  };



  useEffect(()=>{
    if(!authentication_user){
        checkAuth();
    }
  },[authentication_user]);



  const routes = useRoutes([
    {
      path: "/home",
      element: <HomePage />
    },
    {
      path: "/",
      element: <UserRegister />
    },
    {
      path: "/otp",
      element: <OTP/>
    }
  ]);

  return routes;
};

export default UserWrapper;
