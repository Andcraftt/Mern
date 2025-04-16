import {FaSignInAlt, FaSignOutAlt, FaUser} from 'react-icons/fa'
import {Link, useNavigate} from 'react-router-dom'
import {useSelector, useDispatch} from 'react-redux'
import { logout, reset } from '../features/auth/authSlice'
import { IoHome } from "react-icons/io5";

function Header() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const onLogout = () => {
    dispatch(logout())
    dispatch(reset())
    navigate('/')
  }

  return (
    <header className='header'>
      <div className='logo'>
        <Link to='/'>
        <img src="/LOGOFINAL.png" alt="Descripción de la imagen" width="400"/>
        </Link>
      </div>
      
      <nav className='header-nav'>
        <ul>
          {user ? (
            <>
              <li>
                <Link to='/categories' className='nav-link btn3'>
                  <IoHome />&nbsp;Home
                </Link>
              </li>
              <li>
                <Link to='/myprofile' className='nav-link btn1'>
                  <FaUser />&nbsp;My Profile
                </Link>
              </li>
              <li>
                <button className='btn' onClick={onLogout}>
                  <FaSignOutAlt />&nbsp;Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to='/login' className='nav-link btn2'>
                  <FaSignInAlt />&nbsp;Login
                </Link>
              </li>
              <li>
                <Link to='/register' className='nav-link btn'>
                  <FaUser />&nbsp;Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  )
}

export default Header