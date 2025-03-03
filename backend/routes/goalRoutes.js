const express = require("express");
const router = express.Router();
const { getGoals, setGoal, updateGoal, deleteGoal } = require("../controllers/goalController");
const { uploadImageToS3, upload } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Get all goals
router.get('/', getGoals);

// Create a goal
router.post('/', protect, setGoal);

// Upload route for images
router.post('/upload', protect, upload.single('image'), uploadImageToS3);

// Update and delete routes
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;