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

        const token = localStorage.getItem("access");

        if (token && !config.url.includes("users/register")&& !config.url.includes("users/otp")){
            config.headers.Authorization = `Bearer ${token}`;

          
        }
        return config;
    },
    (error)=>{
        return Promise.reject(error)
    }
);


// axiosInstance.interceptors.response.use(
//   (response) => response, // Pass successful responses
//   (error) => {
//     if (error.response) {
//       if (error.response.status === 401) {
//         if (!error.config.url.includes("token/")) {
//           localStorage.removeItem("token");

//           // Handle unauthorized responses
//           alert("Session expired. Redirecting to login...(from axiosInterceptor)");
//           window.location.href = "users/login";
//         }
//       }
//       if (error.response.data) {
//         console.log("error.response.data", error.response.data);
//         const message = error.response.data.title
//           ? error.response.data.title[0]
//           : "An error occurred.";
//         toast.error(`Error: ${message}`);
//       }
//     }
//     return Promise.reject(error); // This should be outside the conditional blocks
//   }
// );

  
//   export default axiosInstance;



axiosInstance.interceptors.response.use(
  (response) => response, // Pass successful responses as-is
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Handle Unauthorized (401) error
      if (status === 401 && !error.config.url.includes("token/")) {
        localStorage.removeItem("token");
        toast.error("Session expired. Redirecting to login...");
        window.location.href = "/login";
      }

      // Handle Forbidden (403) error for blocked users
      if (status === 403 && data.error === "User has been blocked by admin.") {
        localStorage.removeItem("token"); 
        toast.error("User has been blocked by admin."); 
        window.location.href = "/login"; 
      }

      // Handle other errors and display the message from the server
      if (data && data.error) {
        toast.error(data.error); 
      } else if (data && data.title) {
        toast.error(data.title[0] || "An error occurred.");
      }
    }

    // Always reject the promise for error responses
    return Promise.reject(error);
  }
);


export default axiosInstance;