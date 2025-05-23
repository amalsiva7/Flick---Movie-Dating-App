import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { BiLoaderAlt } from "react-icons/bi";
import axios from "axios";
import axiosInstance from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';



//Registration component
const UserRegister = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    capitalLetter: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();



  // for email suggestions
  const [emailSuggestions, setEmailSuggestions] = useState([]);

  const commonDomains = ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"];


  // calculation of password strength based on input and show missing requirements
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    let requirements = {
      capitalLetter: false,
      number: false,
      specialChar: false,
    };
    //if password is 8 char long add a strength
    if (password.length >= 8) strength += 1;

    //if password is a Capital letter add a strength
    if (password.match(/[A-Z]/)) {
      strength += 1;
      requirements.capitalLetter = true;
    }
    //if password is a num add a strength
    if (password.match(/[0-9]/)) {
      strength += 1;
      requirements.number = true;
    }
    //if password is a special char add a strength
    if (password.match(/[^A-Za-z0-9]/)) {
      strength += 1;
      requirements.specialChar = true;
    }

    setPasswordRequirements(requirements);
    return strength;
  };


  // handling the changes in the input
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // check for domain names according to input
    if (name === "email" && !value.includes("@")) {
      const suggestions = commonDomains.map(domain => value + domain);
      setEmailSuggestions(suggestions);
    } else {
      setEmailSuggestions([]);
    }
    //check for password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    //validation of fields
    validateField(name, value);
  };

  //Validation Function
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      //checking Username
      case "username":
        if (!value.trim()) {
          newErrors.username = "Please input a name.";
        } else if (value.length < 3) {
          newErrors.username = "Username must be at least 3 characters long";
        } else {
          delete newErrors.username;
        }
        break;

      //checking Email
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = "Please input an email.";
        } else if (!emailRegex.test(value)) {
          newErrors.email = "Invalid email format";
        } else {
          delete newErrors.email;
        }
        break;
        //checking Password
      case "password":
        if (!value.trim()) {
          newErrors.password = "Please input a password.";
        } else if (value.length < 8) {
          newErrors.password = "";
        } else {
          delete newErrors.password;
        }
        break;
        //checking confirmPassword
      case "confirmPassword":
        if (!value.trim()) {
          newErrors.confirmPassword = "Please confirm your password.";
        } else if (value !== formData.password) {
          newErrors.confirmPassword = "Passwords do not match";
        } else {
          delete newErrors.confirmPassword;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // Submmit function
  const handleSubmit = async (e) => {

    e.preventDefault();

    const missingFields = Object.keys(formData).filter(field => !formData[field].trim());
    if (missingFields.length > 0) {
      // Set an error for the missing fields
      const newErrors = { ...errors };
      missingFields.forEach(field => {
        newErrors[field] = `Please input a ${field}`;
      });
      setErrors(newErrors);
      return;
    }
    

    //Last validation check
    const allValid = Object.keys(formData).every(field => {
      validateField(field, formData[field]);
      return !errors[field];
    });
    if (!allValid) return;
    
    

    //if there is no error in the errors
    try {
      console.log(formData);

      const response = await axiosInstance.post("users/register/", formData);

      if (response.status === 201) {

        await toast.success("Hi..Please check your email for verification.");
        sessionStorage.setItem("email", formData.email);

        console.log(formData.email,"asdfasdfasdfasdfasdf")

        navigate("/otp");
      }
    } catch (error) {
      if (error.response) {

        // Handle specific status codes
        if (error.response.status === 409) {
          await toast("User Already Registered! Please check your email for verification.", {icon: '⚠️',});
          sessionStorage.setItem("email", formData.email);

          navigate("/otp"); // Navigate to OTP for 409 Conflict
        } else {

          await toast.error(error.response.data?.message || "An error occurred during registration.");
          console.log(error.response.data?.message,"*******************************")
          console.error("Error during registration:", error);

          setErrors((prev) => ({
            ...prev,
            apiError: "Registration failed. Please try again.",
          }));
        }
      } else {
        // Handle network errors or other issues
        await toast.error("An unexpected error occurred. Please try again later.");
        console.error("Unexpected error during registration:", error);
        setErrors((prev) => ({
          ...prev,
          apiError: "An unexpected error occurred. Please try again later.",
        }));
      }
    }
    
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, email: suggestion });
    setEmailSuggestions([]);
    validateField("email", suggestion);
  };

  return (
    <div className="min-h-screen bg-custom-light-gray flex items-center justify-center px-4 py-8">
      <div className="w-[38.125rem] h-[39.125rem] bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-poppins text-center text-gray-800 mb-2">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
              className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
              aria-label="Username"
              aria-invalid={errors.username ? "true" : "false"}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.username}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
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
              className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
              aria-label="Email"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {emailSuggestions.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 shadow-lg">
                {emailSuggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
            {errors.email && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
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
                className={`mt-1 block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
                aria-label="Password"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff className="text-gray-500" /> : <FiEye className="text-gray-500" />}
              </button>
            </div>
            <div className="mt-2 flex gap-1">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-full rounded ${index < passwordStrength ? 'bg-green-500' : 'bg-gray-200'}`}
                />
              ))}
            </div>
            <div className="text-xs text-red-600 mt-2">
              {!passwordRequirements.capitalLetter && <span>*Include a capital letter, </span>}
              {!passwordRequirements.number && <span>a number, </span>}
              {!passwordRequirements.specialChar && <span>a special character, </span>}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === " ") {
                  e.preventDefault();
                }
              }}
              className={`mt-1 block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200`}
              aria-label="Confirm password"
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600" role="alert">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center h-full">
            <button 
              type="submit"
              disabled={isLoading || Object.keys(errors).length > 0}
              className="w-[157px] items-center justify-center px-4 py-3 border border-transparent rounded-2xl shadow-sm text-base font-medium text-black bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <BiLoaderAlt className="animate-spin h-5 w-5" />
              ) : (
                "Sign Up"
              )}

            </button>
          </div>
        </form>
        <div className="mt-4 text-center">
          <p className="mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
