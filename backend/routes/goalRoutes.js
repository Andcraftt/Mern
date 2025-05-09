const express = require("express");
const router = express.Router();
const { getGoals, setGoal, updateGoal, deleteGoal } = require("../controllers/goalController");
const { uploadImage, upload } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Get all goals
router.get('/', getGoals);

// Create a goal
router.post('/', protect, setGoal);

// Upload route for images
router.post('/upload', upload.single('image'), uploadImage);

// Update and delete routes
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;