import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axiosConfig";
import toast from "react-hot-toast";



const updateUserToken = async () => {
    const refreshToken = localStorage.getItem("refresh");

    console.log(refreshToken," RefreshToken indside upUsertoken****************************")
    console.log("indside updateUsertoken****************************")

    if (!refreshToken) {
      toast.error("Session expired. Please log in again.");
      window.location.href = "/login";
      return { username: null, id: null, isAuthenticated: false, isAdmin: null };
    }
  
    try {
      const res = await axiosInstance.post('refresh/', {
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
      }
    } catch (error) {
      toast.error("Unable to refresh session. Please log in again.");
      localStorage.clear()
      window.location.href = "/login";
      return { username: null, id: null, isAuthenticated: false, isAdmin:null };
    }
  };




  const isAuthUser = async () => {

    const [isRefreshing, setIsRefreshing] = useState(false);

    if (isRefreshing) return; // Prevent multiple calls
  setIsRefreshing(true);
  try {
    await updateUserToken();
  } finally {
    setIsRefreshing(false);
  }

    const accessToken = localStorage.getItem("access");
    if (!accessToken) {
      return { id: null, username: null, isAuthenticated: false, isAdmin: null };
    }
  
    try {
      const decodedToken = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;
  
      if (decodedToken.exp > currentTime) {
        return {
          id: decodedToken.user_id,
          username: decodedToken.username,
          isAuthenticated: true,
          isAdmin: decodedToken.isAdmin,
        };
      } else {
        console.log("Token expired, attempting to refresh...");
        return await updateUserToken();
      }
    } catch (error) {
      console.error("Invalid token:", error.message);
      toast.error("Invalid session. Please log in again.");
      localStorage.clear();
      window.location.href = "/login";
      return { id: null, username: null, isAuthenticated: false, isAdmin: null };
    }
  };
  

export default isAuthUser;