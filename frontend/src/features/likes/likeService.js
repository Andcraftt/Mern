import axios from 'axios'

const API_URL = 'https://mern-full-stack-1-0.onrender.com/api/likes/'

// Toggle like on a goal
const toggleLike = async (goalId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  console.log(`[likeService] Toggling like for goal ${goalId}`)
  console.log(`[likeService] API URL: ${API_URL + goalId}`)
  
  const response = await axios.post(API_URL + goalId, {}, config)
  console.log(`[likeService] Toggle response data:`, response.data)
  
  return response.data
}

// Check if user has liked a goal
const checkLike = async (goalId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  console.log(`[likeService] Checking like for goal ${goalId}`)
  console.log(`[likeService] API URL: ${API_URL + goalId}`)
  
  const response = await axios.get(API_URL + goalId, config)
  console.log(`[likeService] Check response data:`, response.data)
  
  return response.data
}

// Get likes count for a goal
const getLikesCount = async (goalId) => {
  console.log(`[likeService] Getting like count for goal ${goalId}`)
  console.log(`[likeService] API URL: ${API_URL + 'count/' + goalId}`)
  
  const response = await axios.get(API_URL + 'count/' + goalId)
  console.log(`[likeService] Count response data:`, response.data)
  
  return response.data
}

// Get likes counts for multiple goals
const getMultipleLikesCounts = async (goalIds) => {
  console.log(`[likeService] Getting like counts for multiple goals:`, goalIds)
  console.log(`[likeService] API URL: ${API_URL + 'counts'}`)
  
  const response = await axios.post(API_URL + 'counts', { goalIds })
  console.log(`[likeService] Multiple counts response data:`, response.data)
  
  return response.data
}

const likeService = {
  toggleLike,
  checkLike,
  getLikesCount,
  getMultipleLikesCounts
}

export default likeService