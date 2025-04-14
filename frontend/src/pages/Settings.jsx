import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { toast } from 'react-toastify'
import { FaUser, FaTrash } from 'react-icons/fa'
import Spinner from '../components/Spinner'
import { updateUser, deleteAccount, reset, logout } from '../features/auth/authSlice'

function Settings() {
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  )

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  })

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { name, email, password, confirmPassword, currentPassword } = formData

  useEffect(() => {
    if (!user) {
      navigate('/login')
    } else {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || '',
        email: user.email || ''
      }))
    }

    if (isError) {
      toast.error(message)
    }

    if (isSuccess && message) {
      toast.success(message)
    }

    return () => {
      dispatch(reset())
    }
  }, [user, navigate, isError, isSuccess, message, dispatch])

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }))
  }

  const onSubmit = (e) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    // Only include fields that have been changed
    const userData = {
      currentPassword: currentPassword
    }

    if (name !== user.name) userData.name = name
    if (email !== user.email) userData.email = email
    if (password) userData.password = password

    // Don't update if only currentPassword is provided
    if (Object.keys(userData).length === 1 && userData.currentPassword) {
      toast.error('No changes detected')
      return
    }

    dispatch(updateUser(userData))
  }

  const handleDeleteAccount = () => {
    if (currentPassword) {
      dispatch(deleteAccount(currentPassword))
        .then(unwrappedResult => {
          if (!unwrappedResult.error) {
            toast.success('Account deleted successfully')
            dispatch(logout())
            navigate('/')
          }
        })
    } else {
      toast.error('Please enter your current password to delete your account')
    }
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <>
      <section className='heading'>
        <h1>
          <FaUser /> Settings
        </h1>
        <p>Update your profile information</p>
      </section>

      <section className='form'>
        <form onSubmit={onSubmit}>
          <div className='form-group'>
            <label htmlFor='name'>Name</label>
            <input
              type='text'
              className='form-control'
              id='name'
              name='name'
              value={name}
              placeholder='Enter your name'
              onChange={onChange}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              className='form-control'
              id='email'
              name='email'
              value={email}
              placeholder='Enter your email'
              onChange={onChange}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='password'>New Password (leave blank to keep current)</label>
            <input
              type='password'
              className='form-control'
              id='password'
              name='password'
              value={password}
              placeholder='Enter new password'
              onChange={onChange}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='confirmPassword'>Confirm New Password</label>
            <input
              type='password'
              className='form-control'
              id='confirmPassword'
              name='confirmPassword'
              value={confirmPassword}
              placeholder='Confirm new password'
              onChange={onChange}
            />
          </div>
          <div className='form-group'>
            <label htmlFor='currentPassword'>Current Password (required for changes)</label>
            <input
              type='password'
              className='form-control'
              id='currentPassword'
              name='currentPassword'
              value={currentPassword}
              placeholder='Enter current password'
              onChange={onChange}
            />
          </div>

          <div className='form-group'>
            <button type='submit' className='btn btn-block'>
              Update Profile
            </button>
          </div>
        </form>
      </section>

      <section className='danger-zone'>
        <h2>Danger Zone</h2>
        {!showDeleteConfirm ? (
          <button 
            className='btn btn-danger'
            onClick={() => setShowDeleteConfirm(true)}
          >
            <FaTrash /> Delete Account
          </button>
        ) : (
          <div className='delete-confirm'>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <p>Please enter your current password above to confirm.</p>
            <div className='buttons'>
              <button 
                className='btn btn-danger'
                onClick={handleDeleteAccount}
              >
                Confirm Delete
              </button>
              <button 
                className='btn'
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  )
}

export default Settings