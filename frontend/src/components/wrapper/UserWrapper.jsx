import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useRoutes } from 'react-router-dom';
import HomePage from '../../pages/homePage';
import UserRegister from '../user_side/auth/userRegister';
import OTP from '../user_side/auth/OTP';
import Login from '../user_side/auth/Login';
import isAuthUser from '../../utils/isAuth';
import LoginPrivateRoute from '../private_routes/LoginPrivateRoute';
import UserHomeHeader from '../user_side/userHomePage/userHomeHeader';
import UserHome from '../user_side/userHomePage/userHome';
import PrivateRoutes from '../private_routes/PrivateRoute';
import { setAuthentication } from '../../Redux/Authentication/authenticationSlice';
import MagicLink from '../user_side/auth/MagicLink';
import UserProfile from '../user_side/userProfile/UserProfile';
import UserCard from '../user_side/userhomepage/UserCard';
import UserFlickPage from '../user_side/userhomepage/UserFlickPage';

const UserWrapper = () => {
  const authentication_user = useSelector((state) => state.authentication_user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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


  // useEffect(() => {
  //   if (!authentication_user?.isAuthenticated) {
  //     checkAuth();
  //   } else if (authentication_user.isAuthenticated) {
  //     if (authentication_user.isAdmin) {
  //       navigate('/admin'); // Adjust this path as needed
  //     } else {
  //       navigate('/user/home');
  //     }
  //   }
  // }, [authentication_user, dispatch, navigate]);
  

  useEffect(()=>{
    checkAuth();
  })


  const routes = useRoutes([

    {
      path: "/",
      element: 
      (<LoginPrivateRoute>
        <UserRegister/>
      </LoginPrivateRoute>)
      
    },
    {
      path: "/otp",
      element: <OTP/>
    },
    {
      path: '/verify', 
      element: <MagicLink/>
    },
    {
      path: "/login",
      element: (
        <LoginPrivateRoute>
          <Login/>
        </LoginPrivateRoute>
      )
    },
    {
      path: "/user",
      element: (
        <PrivateRoutes>
          <UserHome />
        </PrivateRoutes>
      ),
      children: [
        {
          path: "home",
          element: (
            <PrivateRoutes>
              <UserCard />
            </PrivateRoutes>
          )
        },
        {
          path: "profile",
          element: (
            <PrivateRoutes>
              <UserProfile />
            </PrivateRoutes>
          )
        },
        {
          path: "flick",
          element: (
            <PrivateRoutes>
              <UserFlickPage/>
            </PrivateRoutes>
          )
        },
        
        {
          path: "subscription",
          element: (
            <PrivateRoutes>
              {/* Add your Subscription component */}
            </PrivateRoutes>
          )
        },
        {
          path: "settings",
          element: (
            <PrivateRoutes>
              {/* Add your Settings component */}
            </PrivateRoutes>
          )
        },
        {
          path: "contact",
          element: (
            <PrivateRoutes>
              {/* Add your Contact component */}
            </PrivateRoutes>
          )
        },
        {
          path: "about",
          element: (
            <PrivateRoutes>
              {/* Add your About component */}
            </PrivateRoutes>
          )
        }
      ]
    }
  ]);

  return routes;
};

export default UserWrapper;
