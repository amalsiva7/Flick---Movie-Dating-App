import React, { useState } from "react";
import { FaEye, FaEyeSlash, FaSpinner } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuthentication } from "../../../Redux/Authentication/authenticationSlice";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePassword = (password) => password.length >= 8;

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "email") {
      if (!value) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(value)) {
        newErrors.email = "Invalid email format";
      } else {
        delete newErrors.email;
      }
    }

    if (name === "password") {
      if (!value) {
        newErrors.password = "Password is required";
      } else if (!validatePassword(value)) {
        newErrors.password = "Password must be at least 8 characters";
      } else {
        delete newErrors.password;
      }
    }

    setErrors(newErrors);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        const response = await axiosInstance.post("users/login/", formData);
        
        if (response.status === 200) {
            const { access, refresh, username, user_id } = response.data;
            
            // Store tokens
            localStorage.setItem("access", access);
            localStorage.setItem("refresh", refresh);

            const decodedToken = jwtDecode(access);

            console.log("username in Login: ",username)
            console.log("user_id in Login: ",user_id)
            console.log("userAuthenticated in Login: ",decodedToken.isAuthenticated)
            console.log("user isAdmin in Login: ",decodedToken.isAdmin)
            
            // Update authentication state
            dispatch(setAuthentication({
                id: user_id,  // Use from response instead of decoded token
                username: username,  // Use from response instead of decoded token
                isAuthenticated: true,
                isAdmin: decodedToken.isAdmin,
            }));

            // Navigate based on user role
            if (decodedToken.isAdmin) {
                navigate("/admin");
            } else {
                navigate("/user/home");
            }

            toast.success("Login Success");
        }
    } catch (error) {
        handleLoginError(error);
    } finally {
        setIsLoading(false);
    }
};

// Error handling utility
const handleLoginError = (error) => {
    if (error.response?.data) {
        const errorData = error.response.data;
        
        if (errorData.email?.[0] === "Your account is blocked. Please contact support for assistance") {
            toast.error(errorData.email[0]);
            return;
        }

        // Handle other specific error messages
        const errorMessage = 
            errorData.message || 
            errorData.email?.[0] || 
            errorData.password?.[0] || 
            "An error occurred during login";
            
        toast.error(errorMessage);
    } else {
        toast.error("An error occurred during login. Please try again");
    }
};

  const isFormValid =
    formData.email &&
    formData.password &&
    Object.keys(errors).length === 0;

  return (
    <div className="min-h-screen bg-custom-light-gray flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Email Field */}
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              aria-invalid={errors.email ? "true" : "false"}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={isLoading}
            />
            {errors.email && (
              <p
                id="email-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
                aria-live="assertive"
              >
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                aria-invalid={errors.password ? "true" : "false"}
                aria-describedby={errors.password ? "password-error" : undefined}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p
                id="password-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
                aria-live="assertive"
              >
                {errors.password}
              </p>
            )}
          </div>

          {/* API Error Message */}
          {errors.apiError && (
            <p
              className="mt-1 text-sm text-red-500"
              role="alert"
              aria-live="assertive"
            >
              {errors.apiError}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !isFormValid}
            className="w-full bg-yellow-400 text-black py-2 px-4 rounded-lg hover:bg-yellow-300 focus:ring-4 focus:ring-blue-300 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        {/* Additional Options */}
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
          <p className="mt-2">
            Don't have an account?{" "}
            <a href="/" className="text-blue-600 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
