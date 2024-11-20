import { BrowserRouter, Route, Router, Routes } from 'react-router-dom';
import UserWrapper from './components/wrapper/userWrapper';
import UserRegister from './components/user_side/auth/userRegister';


function App() {

  return (
      <>
      
        {/* <BrowserRouter>
          <Routes>
            <Route path='/*' element={<UserWrapper/>}></Route>
          </Routes>        
        </BrowserRouter> */}

        <UserRegister/>
      </>
  );
};

export default App;
