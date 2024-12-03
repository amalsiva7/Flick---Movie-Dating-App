import React from 'react';
import { Link } from 'react-router-dom';
import welcomeImage from '../assets/welcome.jpg';


const HomePage = () => {
  return (
    <>
      <header className="flex justify-between p-6">
        <div className="container mx-auto flex justify-around items-center">
          {/* Navigation or Empty Divs */}
          <div className="flex"></div>
          <div className="flex"></div>
          <div className="flex"></div>
          <div className="flex"></div>

          {/* SignUp Button */}
          <div className="flex text-white">
            <Link
              to="/logout"
              className="ml-auto px-6 py-3 bg-[#7157FE] text-white font-semibold rounded-sm hover:bg-blue-700"
            >
              Logout
            </Link>
          </div>
        </div>
      </header>

      {/* Image Section */}
      <div>
        <div className="flex items-center justify-center min-h-screen bg-black">
            <img
                src={welcomeImage}
                alt="Welcome"
                className="max-w-[50%] max-h-[50%] object-contain"
            />

        </div>
      </div>
    </>
  );
};

export default HomePage;
