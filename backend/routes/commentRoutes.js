const express = require("express");
const router = express.Router();
const { 
    getComments, 
    getCommentsByGoal,
    setComment, 
    updateComment, 
    deleteComment 
} = require("../controllers/commentController");
const { protect } = require('../middleware/authMiddleware');

// Get all comments
router.get('/', getComments);

// Get comments by goal
router.get('/goal/:goalId', getCommentsByGoal);

// Create a comment
router.post('/', protect, setComment);

// Update and delete routes
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;