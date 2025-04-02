import axios from 'axios'

const API_URL = 'https://mern-full-stack-1-0.onrender.com/api/comments'

// Get comments for a specific goal
const getCommentsByGoal = async (goalId) => {
  const response = await axios.get(`${API_URL}/goal/${goalId}`)
  return response.data
}

// Create new comment
const createComment = async (commentData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.post(API_URL, commentData, config)
  return response.data
}

// Delete comment
const deleteComment = async (commentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }

  const response = await axios.delete(API_URL + '/' + commentId, config)
  return response.data
}

const commentService = {
  getCommentsByGoal,
  createComment,
  deleteComment,
}

export default commentService