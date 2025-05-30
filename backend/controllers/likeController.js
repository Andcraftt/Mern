const asyncHandler = require('express-async-handler');
const Like = require('../models/likeModel');
const Goal = require('../models/goalModel');
const mongoose = require('mongoose');

// @desc    Toggle like for a goal
// @route   POST /api/likes/:goalId
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  // Verificar si el goal existe
  const goal = await Goal.findById(goalId);
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const existingLike = await Like.findOne({ user: userId, goal: goalId });

  if (existingLike) {
    await existingLike.deleteOne();
    const likeCount = await Like.countDocuments({ goal: goalId });
    return res.status(200).json({
      message: "Like removed",
      liked: false,
      likeCount,
    });
  } else {
    await Like.create({ user: userId, goal: goalId });
    const likeCount = await Like.countDocuments({ goal: goalId });
    return res.status(201).json({
      message: "Like added",
      liked: true,
      likeCount,
    });
  }
});

// @desc    Check if user liked a goal
// @route   GET /api/likes/:goalId
// @access  Private
const checkLike = asyncHandler(async (req, res) => {
  const { goalId } = req.params;
  const userId = req.user.id;

  // Verify the goal exists
  const goal = await Goal.findById(goalId);
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  // Check if the user has liked this goal
  const existingLike = await Like.findOne({ user: userId, goal: goalId });
  
  res.status(200).json({ 
    liked: !!existingLike,
    likeCount: await Like.countDocuments({ goal: goalId })
  });
});

// @desc    Get likes count for a goal
// @route   GET /api/likes/count/:goalId
// @access  Public
const getLikesCount = asyncHandler(async (req, res) => {
  const { goalId } = req.params;

  // Verify the goal exists
  const goal = await Goal.findById(goalId);
  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  const likeCount = await Like.countDocuments({ goal: goalId });
  
  res.status(200).json({ likeCount });
});

// @desc    Get likes count for multiple goals
// @route   POST /api/likes/counts
// @access  Public
const getMultipleLikesCounts = asyncHandler(async (req, res) => {
  const { goalIds } = req.body;

  if (!Array.isArray(goalIds) || goalIds.length === 0) {
    res.status(400);
    throw new Error('Invalid or empty goalIds array');
  }

  // Validate all goal IDs exist
  const existingGoals = await Goal.find({ _id: { $in: goalIds } });
  if (existingGoals.length !== goalIds.length) {
    res.status(404);
    throw new Error('One or more goals not found');
  }

  // Get likes count for each goal
  const likeCounts = await Promise.all(
    goalIds.map(async (goalId) => ({
      goalId,
      likeCount: await Like.countDocuments({ goal: goalId })
    }))
  );
  
  res.status(200).json(likeCounts);
});

module.exports = {
  toggleLike,
  checkLike,
  getLikesCount,
  getMultipleLikesCounts
};
