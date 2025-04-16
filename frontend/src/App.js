import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Myprofile from './pages/Myprofile';
import Settings from './pages/Settings';
import Categories from './pages/Categories';

function App() {
  return (
    <>
      <Router>
        <div className='container'>
          <Header />
          <Routes>
            <Route path='/' element={<Dashboard/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/register' element={<Register/>}/>
            <Route path='/myprofile' element={<Myprofile/>}/>
            <Route path='/settings' element={<Settings/>}/>
            <Route path='/categories' element={<Categories/>}/>
          </Routes>
        </div>
      </Router>
      <ToastContainer />
    </>
  );
}

export default App;
