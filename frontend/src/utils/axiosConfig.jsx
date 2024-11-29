import axios from "axios";

const axiosInstance = axios.create({
    baseURL : import.meta.env.VITE_API_BASE_URL,
    timeout : 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.request.use(
    (config)=>{

        const token = localStorage.getItem("token");

        if (token && !config.url.includes("users/register")&& !config.url.includes("users/otp")){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error)
    }
);


axiosInstance.interceptors.response.use(
    (response) => response, // Pass successful responses
    (error) => {
      if (error.response) {
        if (error.response.status === 401) {
          // Handle unauthorized responses
          alert("Session expired. Redirecting to login...");
          window.location.href = "users/login";
        }
      }
      return Promise.reject(error);
    }
  );
  
  export default axiosInstance;