const express = require("express");
const router = express.Router();
const { 
    toggleLike, 
    checkLike, 
    getLikesCount,
    getMultipleLikesCounts
} = require("../controllers/likeController");
const { protect } = require('../middleware/authMiddleware');

// Make sure the count route comes BEFORE the :goalId parameter route
// to prevent route conflicts
router.get('/count/:goalId', getLikesCount);

// Get likes count for multiple goals (public)
router.post('/counts', getMultipleLikesCounts);

// Toggle like on a goal (requires authentication)
router.post('/:goalId', protect, toggleLike);

// Check if user liked a goal (requires authentication)
router.get('/:goalId', protect, checkLike);

module.exports = router;