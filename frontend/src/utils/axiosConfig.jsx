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

      console.log("Session expired. Redirecting to login...");

      // Handle Unauthorized (401) errors
      if (status === 401) {
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
        if (data.error) {
          toast.error(data.error);
        } else if (data.title) {
          toast.error(data.title[0] || "An error occurred.");
        } else {
          toast.error("An unexpected error occurred.");
        }
      }
    } else if (error.request) {
      // Request was made but no response received
      toast.error("No response received from the server.");
    } else {
      // Something happened in setting up the request
      toast.error("Error setting up the request.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;