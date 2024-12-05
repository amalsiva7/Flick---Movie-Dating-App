import React, { useState, useRef, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const OTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email");
  const [debouncedOtp, setDebouncedOtp] = useState(""); // Store debounced OTP

  // Focus on the first input field on component mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input changes
  const handleChange = (element, index) => {
    if (isNaN(element.value) || element.value === " ") return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Automatically move to the next input field
    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    validateOTP(newOtp.join(""));
  };

  // Handle backspace key press
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // Validate OTP for numeric input
  const validateOTP = (code) => {
    const otpRegex = /^[0-9]{6}$/;
    if (code.length === 6 && !otpRegex.test(code)) {
      setError("Please enter only numbers");
    } else {
      setError("");
    }
  };

  // Debounced function for OTP verification
  const debouncedSubmit = (otpCode) => {
    clearTimeout(debouncedOtp);
    setDebouncedOtp(otpCode); // Update debounced OTP

    // Delay for debouncing
    setTimeout(async () => {
      if (otpCode.length === 6) {
        handleSubmit(otpCode);
      }
    }, 500); //debounce delay
  };

  // Submit the OTP for verification
  const handleSubmit = async (otpCode) => {
    if (otpCode.length !== 6) {
      setError("Please enter all digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("otp", otpCode);
      formData.append("email", email);

      const response = await axiosInstance.post("users/verify/", formData);

      if (response.status === 200) {
        const message = response.data.message || "OTP verification successful";
        toast.success(message);
        navigate("/login");
      }
    } catch (error) {
      setLoading(false);

      // Check if the error has a response
      if (error.response) {
          const { status, data } = error.response;

          // Log detailed error information for debugging
          console.error("Error response status:", status);
          console.error("Error response data:", data);

          // Handle specific error statuses
          if (status === 400) {
              // Ensure that the error message is properly displayed from the response
              const errorMessage = data.error || "Invalid OTP or token.";
              toast.error(errorMessage);  // Display the error message
          } else if (status === 404) {
              toast.error(data.error || "User or verification record not found.");
          } else if (status === 410) {
              toast.error(data.error || "OTP has expired. Please request a new one.");
          } else {
              toast.error("An unexpected error occurred. Please try again.");
          }
      } else {
          // If no response, handle network errors
          console.error("Error details:", error);
          toast.error("Network error. Please check your connection.");
      }
  } finally {
      setLoading(false);
    }

    
  };

  // Handle OTP resend
  const handleResend = async () => {
    setLoading(true);
  
    try {
      const response = await axiosInstance.post("users/resend-otp/", { email });
  
      if (response.status === 200) {
        toast.success("OTP has been resent to your email. Please verify.");
      } else {
        toast.error(response.data.message || "An error occurred while resending OTP.");
      }
    } catch (error) {
      toast.error("Error resending OTP. Please try again.");
      console.error("Error resending OTP:", error);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-custom-light-gray flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h1>
          <p className="text-gray-600">We sent a code to your email</p>
        </div>

        <div className="space-y-4">
          {/* OTP Input Fields */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                ref={(ref) => (inputRefs.current[index] = ref)}
                className="w-12 h-12 border-2 rounded-lg text-center text-xl font-semibold
                          focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200
                          transition-all duration-300 ease-in-out
                          disabled:bg-gray-100 disabled:cursor-not-allowed"
                aria-label={`OTP digit ${index + 1}`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-sm text-center animate-shake">
              {error}
            </p>
          )}

          {/* Submit Button */}
          <button
            onClick={() => debouncedSubmit(otp.join(""))}
            disabled={loading || otp.join("").length !== 6}
            className="w-full py-3 bg-blue-600 text-white rounded-lg
                     hover:bg-blue-700 focus:outline-none focus:ring-2
                     focus:ring-blue-400 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-300 ease-in-out"
          >
            {loading ? (
              <FaSpinner className="animate-spin mx-auto h-5 w-5" />
            ) : (
              "Verify OTP"
            )}
          </button>

          {/* Resend OTP Button */}
          <p className="text-center text-sm text-gray-600">
            Didn't receive the code?{" "}
            <button
              className="text-blue-600 hover:text-blue-800 font-medium"
              onClick={handleResend}
              disabled={loading}
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTP;
