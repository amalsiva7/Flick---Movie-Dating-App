import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axiosConfig";
import toast from "react-hot-toast";

// Helper function to get default authentication state
const getDefaultAuthState = () => ({
  username: null,
  id: null,
  isAuthenticated: false,
  isAdmin: null
});

// Helper function to clear authentication data
const clearAuthData = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
};

// Token refresh logic
const updateUserToken = async () => {
  const refreshToken = localStorage.getItem("refresh");

  if (!refreshToken) {
    toast.error("Session expired. Please log in again.");
    clearAuthData();
    return getDefaultAuthState();
  }

  try {
    const res = await axiosInstance.post('/refresh/', {
      refresh: refreshToken,
    });

    if (res.status === 200) {
      // Update tokens in local storage
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      // Decode new access token
      const decoded = jwtDecode(res.data.access);
      return {
        username: decoded.username,
        id: decoded.user_id,
        isAuthenticated: true,
        isAdmin: decoded.isAdmin
      };
    }
  } catch (error) {
    toast.error("Unable to refresh session. Please log in again.");
    clearAuthData();
    return getDefaultAuthState();
  }
};

// Main authentication check function
const isAuthUser = async () => {
  const accessToken = localStorage.getItem("access");
  
  if (!accessToken) {
    return getDefaultAuthState();
  }

  try {
    const decodedToken = jwtDecode(accessToken);
    const currentTime = Date.now() / 1000;

    // Check if token is valid and not expired
    if (decodedToken.exp > currentTime) {
      return {
        id: decodedToken.user_id,
        username: decodedToken.username,
        isAuthenticated: true,
        isAdmin: decodedToken.isAdmin,
      };
    } else {
      // Token expired, attempt to refresh
      return await updateUserToken();
    }
  } catch (error) {
    console.error("Token validation error:", error.message);
    clearAuthData();
    return getDefaultAuthState();
  }
};

export default isAuthUser;