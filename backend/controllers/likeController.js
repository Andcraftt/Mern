const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

const Goal = require('../models/goalModel')
const User = require('../models/userModel')
const Like = require('../models/likeModel')

// @desc    Toggle like on a goal
// @route   POST /api/likes/:goalId
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
    const goalId = req.params.goalId;
    const userId = req.user.id;

    // Verify the goal exists
    const goal = await Goal.findById(goalId);
    if (!goal) {
        res.status(404);
        throw new Error('Goal not found');
    }

    // Check if the user has already liked this goal
    const existingLike = await Like.findOne({ user: userId, goal: goalId });

    if (existingLike) {
        // If like exists, remove it (unlike)
        await existingLike.deleteOne();
        res.status(200).json({ liked: false, goalId });
    } else {
        // If no like exists, create one
        const like = await Like.create({
            user: userId,
            goal: goalId
        });
        res.status(200).json({ liked: true, goalId });
    }
});

// @desc    Check if user liked a goal
// @route   GET /api/likes/:goalId
// @access  Private
const checkLike = asyncHandler(async (req, res) => {
    const goalId = req.params.goalId;
    const userId = req.user.id;

    const like = await Like.findOne({ user: userId, goal: goalId });
    
    res.status(200).json({ liked: !!like, goalId });
});

// @desc    Get likes count for a goal
// @route   GET /api/likes/count/:goalId
// @access  Public
const getLikesCount = asyncHandler(async (req, res) => {
    const goalId = req.params.goalId;

    // Count likes for the goal
    const count = await Like.countDocuments({ goal: goalId });
    
    res.status(200).json({ count, goalId });
});

// @desc    Get likes count for multiple goals
// @route   POST /api/likes/counts
// @access  Public
const getMultipleLikesCounts = asyncHandler(async (req, res) => {
    const { goalIds } = req.body;

    if (!goalIds || !Array.isArray(goalIds)) {
        res.status(400);
        throw new Error('Goal IDs must be provided as an array');
    }

    // Get like counts for each goal ID using aggregation
    // Fixed: Create valid ObjectIDs for the MongoDB query
    const objectIds = goalIds.map(id => new mongoose.Types.ObjectId(id));
    
    const counts = await Like.aggregate([
        { $match: { goal: { $in: objectIds } } },
        { $group: { _id: '$goal', count: { $sum: 1 } } }
    ]);

    // Format the response to match goalId with count
    const likeCounts = {};
    counts.forEach(item => {
        likeCounts[item._id.toString()] = item.count;
    });

    // Ensure all requested goalIds are in the response, even if they have no likes
    goalIds.forEach(goalId => {
        if (!likeCounts[goalId]) {
            likeCounts[goalId] = 0;
        }
    });

    res.status(200).json(likeCounts);
});

module.exports = {
    toggleLike,
    checkLike,
    getLikesCount,
    getMultipleLikesCounts
}