import axios from 'axios'

const API_URL = 'https://mern-full-stack-1-0.onrender.com/api/users/'

// Register user
const register = async (userData) => {
  try {
    const response = await axios.post(API_URL, userData)

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  } catch (error) {
    // Re-throw the error so it can be caught by the slice
    throw error
  }
}

// Login user
const login = async (userData) => {
  try {
    // Validate input on frontend too
    if (!userData.email || !userData.password) {
      throw new Error('Please provide both email and password')
    }

    const response = await axios.post(API_URL + 'login', userData)

    // Only store user data if we get a valid response with token
    if (response.data && response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data))
      return response.data
    } else {
      throw new Error('Invalid response from server')
    }
  } catch (error) {
    // Make sure we don't store anything on login failure
    localStorage.removeItem('user')
    
    // Re-throw the error so it can be caught by the slice
    throw error
  }
}

// Update user
const updateUser = async (userData, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided')
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }

    const response = await axios.put(API_URL + 'update', userData, config)

    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data))
    }

    return response.data
  } catch (error) {
    throw error
  }
}

// Delete account
const deleteAccount = async (currentPassword, token) => {
  try {
    if (!token) {
      throw new Error('No authentication token provided')
    }

    if (!currentPassword) {
      throw new Error('Current password is required')
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: { currentPassword }
    }

    const response = await axios.delete(API_URL + 'delete', config)

    if (response.data) {
      localStorage.removeItem('user')
    }

    return response.data
  } catch (error) {
    throw error
  }
}

// Logout user
const logout = () => {
  localStorage.removeItem('user')
}

const authService = {
  register,
  logout,
  login,
  updateUser,
  deleteAccount,
}

export default authService