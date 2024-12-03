import React from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import UserWrapper from './components/wrapper/userWrapper';
import HomePage from './pages/homePage';
import UserRegister from './components/user_side/auth/userRegister';
import OTP from './components/user_side/auth/OTP';
import Login from './components/user_side/auth/Login';
import { Provider } from 'react-redux';
import userStore from './Redux/userStore';



function App() {

  return (
      <>
      
        <BrowserRouter>
          <Provider store={userStore}>
            <Routes>
              <Route path='/*' element={<UserWrapper/>}/>
            </Routes>       

          </Provider>
           
        </BrowserRouter>
        
      </>
  );
};

export default App;
