import axios from 'axios'

const API_URL = 'https://mern-full-stack-1-0.onrender.com/api/goals'

// Create new goal
const createGoal = async (goalData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, goalData, config)

  return response.data
}

// Get user goals
const getGoals = async () => {
  const response = await axios.get(API_URL)

  return response.data
}

// Get comments by goal

const getCommentsByGoal = async () => {
  const response = await axios.get('')

  return response.data
}


// Delete user goal
const deleteGoal = async (goalId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.delete(API_URL + '/' + goalId  , config)

  return response.data
}

const goalService = {
  createGoal,
  getGoals,
  deleteGoal,
}

export default goalService
