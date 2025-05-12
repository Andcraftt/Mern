import axios from 'axios'

const API_URL = '/api/likes/'

// Toggle like for a goal
const toggleLike = async (goalId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const response = await axios.post(API_URL + goalId, {}, config)
    return response.data
  } catch (error) {
    // Log detailed error information
    console.error('Toggle Like Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    })

    // Throw a more informative error
    if (error.response) {
      // The request was made and the server responded with a status code
      throw new Error(error.response.data.message || 'Failed to toggle like')
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response received from server')
    } else {
      // Something happened in setting up the request
      throw new Error('Error setting up like request')
    }
  }
}

// Check if user liked a goal
const checkLike = async (goalId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }

    const response = await axios.get(API_URL + goalId, config)
    return response.data
  } catch (error) {
    console.error('Check Like Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
}

// Get likes count for a goal
const getLikesCount = async (goalId) => {
  try {
    const response = await axios.get(API_URL + 'count/' + goalId)
    return response.data
  } catch (error) {
    console.error('Get Likes Count Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    throw error
  }
}

const likeService = {
  toggleLike,
  checkLike,
  getLikesCount
}

export default likeService