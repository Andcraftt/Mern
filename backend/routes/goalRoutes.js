const express = require("express");
const router = express.Router();
const { getGoals, setGoal, updateGoal, deleteGoal } = require("../controllers/goalController");
const { uploadImageToImgur, upload } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Get all goals
router.get('/', getGoals);

// Create a goal
router.post('/', protect, setGoal);

// Upload route for images - now using Imgur
router.post('/upload', protect, upload.single('image'), uploadImageToImgur);

// Update and delete routes
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;