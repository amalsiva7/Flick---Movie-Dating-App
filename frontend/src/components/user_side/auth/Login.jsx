import React, { useState } from 'react'
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function Login() {
    const [email,setEmail] = useState("");
    const [password,setPassword] = useState("");
    
    const dispatch = useDispatch();
    const navigate = useNavigate();


  return (
    <div className="min-h-screen bg-custom-light-gray flex items-center justify-center px-4 py-8">
      <div className="w-[38.125rem] h-[39.125rem] bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-poppins text-center text-gray-800 mb-2">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-6">


          {/* Email Field */}
          <div className="relative">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
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
      </div>
    </div>

  )
}

export default Login