import React, { useEffect, useState } from 'react'
import isAuthUser from '../../utils/isAuth';
import { Navigate } from 'react-router-dom';


function PrivateRoutes({children}) {
    const[isAuthenticated,setisAuthenticated] = useState(false);
    const[isLoading,setIsLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
          const authInfo = await isAuthUser();
          setisAuthenticated(authInfo.isAuthenticated);
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        };
        fetchData();
      }, []);
    
    if(isAuthenticated){
        return <Navigate to="/login"/>
    }
  return children;
}

export default PrivateRoutes;