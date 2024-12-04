import React, { useEffect, useState } from "react";
import isAuthUser from "../../utils/isAuth";
import { Loader } from "lucide-react";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminPrivateRoute = ({children}) =>{
    const[isAuthenticated,setIsAuthenticated] = useState(false);
    const[isLoading,setIsLoading] = useState(true);
    const[isAdmin,setIsAdmin] = useState(false);


    useEffect(()=>{
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
                <Loader/>
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