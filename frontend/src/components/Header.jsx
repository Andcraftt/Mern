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
        <Link to='/'> <img src="../../public/Logo.png" alt="Descripción de la imagen" width="400"/></Link>
      </div>
      <ul>
        {user ? (
          <li>
            <div class="btn-container">
              <Link to='/myprofile'> 
                <button className='btn1'> 
                <FaUser style={{ color: 'white',marginRight: '4px' }} />&nbsp;My Profile
                   </button>
              </Link>
              <button className='btn' onClick={onLogout}>
                <FaSignOutAlt />&nbsp;Logout
              </button>
            </div>
          </li>
        ) : (
          <>
            <li>
              <Link to='/login'>
                <FaSignInAlt />&nbsp;Login
              </Link>
            </li>
            <li>
              <Link to='/register'>
                <FaUser />&nbsp;Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </header>
  )
}

export default Header
