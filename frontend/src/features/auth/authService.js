import axios from 'axios'

const API_URL = 'https://mern-full-stack-1-0.onrender.com/api/users/'

// Register user
const register = async (userData) => {
  const response = await axios.post(API_URL, userData)

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  return response.data
}

// Login user
const login = async (userData) => {
  const response = await axios.post(API_URL + 'login', userData)

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  return response.data
}

// Update user
const updateUser = async (userData, token) => {
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
}

// Delete account
const deleteAccount = async (currentPassword, token) => {
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