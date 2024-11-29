import React from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import UserWrapper from './components/wrapper/userWrapper';
import HomePage from './pages/homePage';
import UserRegister from './components/user_side/auth/userRegister';
import OTP from './components/user_side/auth/OTP';



function App() {

  return (
      <>
      
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<UserRegister/>}></Route>
            <Route path='/otp' element={<OTP/>}></Route>
            <Route path='/home' element={<HomePage/>}></Route>
          </Routes>        
        </BrowserRouter>
        
      </>
  );
};

export default App;
