import React from 'react';
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import UserWrapper from './components/wrapper/userWrapper';
import { Provider } from 'react-redux';
import userStore from './Redux/userStore';
import { Toaster } from 'react-hot-toast';
import AdminWrappper from './components/wrapper/AdminWrapper';



function App() {

  return (
      <>
      
        <BrowserRouter>
          <Provider store={userStore}>
            <Routes>
              <Route path='/admin/*' element={<AdminWrappper/>}/>
              <Route path='/*' element={<UserWrapper/>}/>
              
              
            </Routes>       

          </Provider>
           
        </BrowserRouter>

        <Toaster/>
        
      </>
  );
};

export default App;
