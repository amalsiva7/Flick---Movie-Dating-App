import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import UserWrapper from './components/wrapper/userWrapper';


function App() {

  return (
      <>
      
        {/* <BrowserRouter>
          <Routes>
            <Route path='/*' element={<UserWrapper/>}></Route>
          </Routes>        
        </BrowserRouter> */}
        <OTP/>
      </>
  );
};

export default App;
