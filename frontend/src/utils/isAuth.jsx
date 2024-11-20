import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axiosConfig";



const updateUserToken = async () => {
    const refreshToken = localStorage.getItem("refresh");
  
    try {
      const res = await axiosInstance.post('api/refresh/', {
        refresh: refreshToken,
      });
      if (res.status === 200) {
        localStorage.setItem("access", res.data.access);
        localStorage.setItem("refresh", res.data.refresh);
  
        let decoded = jwtDecode(res.data.access);
        return {
          username: decoded.username,
          id: decoded.user_id,
          isAuthenticated: true,
          isAdmin:decoded.isAdmin
        };
      } else {
        return {
          username: null,
          id: null,
          isAuthenticated: false,
          isAdmin:null
        };
      }
    } catch (error) {
      return { username: null, id: null, isAuthenticated: false, isAdmin:null };
    }
  };




const isAuthUser = async () =>{
    const accessToken = localStorage.getItem("access");

    if(!accessToken){
        return {id:null, username:null, isAuthenticated:false,isAdmin:null};
    }

    const currentTime = Date.now()/1000;

    let decoded_token = jwtDecode(accessToken);

    if (decoded_token.exp>currentTime){
        return{
            id : decoded_token.user_id,
            username : decoded_token.username,
            isAuthenticated : true,
            isAdmin : decoded_token.isAdmin
        };

    }else{
        const UpdateSuccess = await updateUserToken();
        return UpdateSuccess;
    }

};

export default isAuthUser;