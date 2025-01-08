import axios from "axios";
import { toast } from 'react-hot-toast';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("access");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response; 

      // Handle Unauthorized (401) errors
      if (status === 401) {
        console.log("Session expired. Redirecting to login...");
        localStorage.clear();
        toast.error("Session expired. Redirecting to login...");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Handle Forbidden (403) errors for blocked users
      if (status === 403 && data.error === "User has been blocked by admin.") {
        localStorage.clear();
        toast.error("User has been blocked by admin.");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      // Handle other specific error messages
      if (data) {
        if(status === 403 && data.error === "Profile not completed"){
          return Promise.reject(error);

        }else if (typeof data === "object") {
          // Loop through the error object to extract messages
          const errorMessages = Object.values(data)
            .flat()
            .join(" ");
          toast.error(errorMessages);
        }else if (data.error) {
          toast.error(data.error);

        } else if (data.title) {
          toast.error(data.title[0] || "An error occurred.");
          
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error("No response received from the server. Please check your connection.");
    } else {
      // Something happened in setting up the request
      toast.error("An error occurred while processing your request.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;