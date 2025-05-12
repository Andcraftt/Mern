import axios from 'axios'

const API_URL = 'https://mern-full-stack-1-0.onrender.com/api/likes/'

// Toggle like on a goal
const toggleLike = async (goalId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  try {
    const response = await axios.post(API_URL + goalId, {}, config);
    return response.data;
  } catch (error) {
    // Mejor manejo de errores
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error data:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      throw new Error(error.response.data.message || 'Failed to toggle like');
    } else if (error.request) {
      // La solicitud fue hecha pero no se recibió respuesta
      console.error('No response received:', error.request);
      throw new Error('No response from server');
    } else {
      // Error al configurar la solicitud
      console.error('Request setup error:', error.message);
      throw new Error('Request setup failed');
    }
  }
};

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

const likeService = {
  toggleLike,
  checkLike,
  getLikesCount
}

export default likeService