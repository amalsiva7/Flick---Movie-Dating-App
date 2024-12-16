import axios from "axios";
import { useNavigate } from "react-router-dom";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 5000, // Adjust as needed
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
  async (error) => {
    const navigate = useNavigate(); // Use inside a hook or wrap for global access

    // Handle 401 errors for token expiration
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem("refresh");
      if (refreshToken) {
        try {
          const response = await axios.post("refresh/", {
            refresh: refreshToken,
          });
          const { access } = response.data;

          localStorage.setItem("access", access);

          // Retry the original request
          error.config.headers.Authorization = `Bearer ${access}`;
          return axiosInstance.request(error.config);
        } catch (refreshError) {
          localStorage.clear(); // Clear tokens on failure
          navigate("/login");
          return Promise.reject(refreshError);
        }
      } else {
        localStorage.clear();
        navigate("/login");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
