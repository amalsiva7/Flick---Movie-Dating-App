import React, { useEffect, useState } from 'react';
import isAuthUser from '../../utils/isAuth';
import { Navigate } from 'react-router-dom';
import HeartLoader from '../loader/HeartLoader';

function LoginPrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const authInfo = await isAuthUser();
      setIsAdmin(authInfo.isAdmin);
      setIsAuthenticated(authInfo.isAuthenticated);
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div>
        <HeartLoader />
      </div>
    );
  }

  // Redirect based on authentication and role
  if (isAuthenticated) {
    if (isAdmin) {
      return <Navigate to="/admin" />;
    }
    return <Navigate to="/userHome" />;
  }

  // Render children if not authenticated
  return children;
}

export default LoginPrivateRoute;
