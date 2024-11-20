import React, { useState, useRef, useEffect } from "react";
import { FaSpinner } from "react-icons/fa";

const OTP = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    validateOTP(newOtp.join(""));
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const validateOTP = (code) => {
    const otpRegex = /^[0-9]{6}$/;
    if (code.length === 6 && !otpRegex.test(code)) {
      setError("Please enter only numbers");
    } else {
      setError("");
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter all digits");
      return;
    }

    setLoading(true);
    try {
      // Simulated API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("OTP submitted:", otpCode);
      setError("");
    } catch (err) {
      setError("Failed to verify OTP");
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

        {error && (
          <p className="text-red-500 text-sm text-center animate-shake">
            {error}
          </p>
        )}

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

        <p className="text-center text-sm text-gray-600">
          Didn't receive the code?{" "}
          <button
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => console.log("Resend OTP")}
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