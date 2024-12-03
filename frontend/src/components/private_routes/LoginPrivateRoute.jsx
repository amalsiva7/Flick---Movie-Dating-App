import React, { useEffect, useState } from 'react'
import isAuthUser from '../../utils/isAuth';
import { Navigate } from 'react-router-dom';
import HeartLoader from '../loader/HeartLoader';


function LoginPrivateRoute({children}) {
    const[isAuthenticated,setisAuthenticated] = useState(false);
    const[isLoading,setIsLoading] = useState(true);


    useEffect(() => {
        const fetchData = async () => {
          const authInfo = await isAuthUser();
          console.log(authInfo,"*************")
          setisAuthenticated(authInfo.isAuthenticated);
          setTimeout(() => {
            setIsLoading(false);
          }, 2000);
        };
        fetchData();
      }, []);
    
    if(isLoading){
      return(
        <div>
          <HeartLoader/>
        </div>
        
      )
    }
    if(isAuthenticated){
        return <Navigate to="/userHome"/>
    }
  return children;
}

export default LoginPrivateRoute