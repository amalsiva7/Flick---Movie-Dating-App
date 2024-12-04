import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosConfig";
import toast from "react-hot-toast";

const AdminUserList = () =>{

    const[users,setUsers] = useState([]);
    const accessToken = localStorage.getItem("access")
    const[searchQuery,setSearchQuery] = useState("");


    const[nextPage,setNextPage] = useState(null);
    const[prevPage,setPrevPage] = useState(null);

    useEffect(()=>{
        fetchUserData();   
    },[])

    const fetchUserData=async(url = "admin/user-lists")=>{
        try{
            // const config={
            //     headers:{
            //         Authorization:`Bearer ${accessToken}`,
            //     },
            // };

            const response = await axiosInstance.get(url);
            if (response===200){
                console.log("Success in FetchUserData");
                setUsers(response.data.results);
                setNextPage(response.data.next);
                setPrevPage(response.data.previous);

            }
        }catch(error){
            console.log(error,"Error from FetchUserData")
            toast.error("Something wrong while loading.")
        }
    };

    return();
};

export default AdminUserList;