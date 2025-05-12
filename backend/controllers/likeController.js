import axios from 'axios'

const API_URL = '/api/likes/'

// Toggle like for a goal
const toggleLike = async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user; // Assuming `req.user` is set by auth middleware

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Try to delete the like (if it exists)
    const deletedLike = await Like.findOneAndDelete(
      { user: userId, goal: goalId },
      { session }
    );

    if (deletedLike) {
      await session.commitTransaction();
      return res.status(200).json({ message: "Like removed" });
    }

    // If no like was deleted, insert a new one
    await Like.create([{ user: userId, goal: goalId }], { session });
    await session.commitTransaction();
    res.status(201).json({ message: "Like added" });
  } catch (error) {
    await session.abortTransaction();
    console.error("Error in toggleLike:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    session.endSession();
  }
};

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

module.exports = {
  toggleLike,
  checkLike,
  getLikesCount
}

export default likeService