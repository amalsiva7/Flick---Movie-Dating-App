import React, { useState, useRef, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";
import axiosInstance from "../../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";

const OTP = ({ email }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);
  const navigate = useNavigate();

  // Focus on the first input field on component mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle OTP input changes
  const handleChange = (element, index) => {
    if (isNaN(element.value)) return; // Prevent non-numeric input

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

  // Validate the OTP for numeric input
  const validateOTP = (code) => {
    const otpRegex = /^[0-9]{6}$/;
    if (code.length === 6 && !otpRegex.test(code)) {
      setError("Please enter only numbers");
    } else {
      setError("");
    }
  };

  // Submit the OTP for verification
  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    // Ensure all digits are filled
    if (otpCode.length !== 6) {
      setError("Please enter all digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("otp", otpCode);
      formData.append("email", email);

      const response = await axiosInstance.post("users/verify/", formData);

      if (response.status === 200) {
        
        navigate("/login");
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
      } else {
        console.error("Error verifying OTP:", error);
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
      
    } catch (error) {
      console.error("Error resending OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
            onClick={handleSubmit}
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
