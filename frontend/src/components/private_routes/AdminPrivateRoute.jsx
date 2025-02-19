import React, { useEffect, useState } from "react";
import isAuthUser from "../../utils/isAuth";
import { Navigate } from "react-router-dom";
import HeartLoader from '../loader/HeartLoader';


const AdminPrivateRoute = ({children}) =>{
    const[isAuthenticated,setIsAuthenticated] = useState(false);
    const[isLoading,setIsLoading] = useState(true);
    const[isAdmin,setIsAdmin] = useState(false);


    useEffect(()=>{
        console.log("your admin came here to AdminProvateRoute")
        const fetchData = async() =>{
            const authInfo = await isAuthUser();
            setIsAuthenticated(authInfo.isAuthenticated);
            setIsAdmin(authInfo.isAdmin);
            setTimeout(()=>{
                setIsLoading(false);
            },1000);
        };
        fetchData();
    },[]);

    if(isLoading){
        return(
            <div>
                <HeartLoader />
            </div>
        );
    }

    if(!isAdmin){
        return <Navigate to="/login"/>;
    }else{
        // alert("Admin Router moonjiii")
    }

    return children

};

export default AdminPrivateRoute;