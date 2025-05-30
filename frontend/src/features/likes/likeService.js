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
  const response = await axios.post(API_URL + goalId, {}, config)
  if (!response){
    console.log(`[likeService] No response received when trying to toggle the like`)
  }
  return response.data
}

// Check if user has liked a goal
const checkLike = async (goalId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
  const response = await axios.get(API_URL + goalId, config)

  return response.data
}

// Get likes count for a goal
const getLikesCount = async (goalId) => {
  const response = await axios.get(API_URL + 'count/' + goalId)
  
  return response.data
}

// Get likes counts for multiple goals
const getMultipleLikesCounts = async (goalIds) => {

  const response = await axios.post(API_URL + 'counts', { goalIds })

  return response.data
}

const likeService = {
  toggleLike,
  checkLike,
  getLikesCount,
  getMultipleLikesCounts
}

export default likeService