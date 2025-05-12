const asyncHandler = require('express-async-handler')
const mongoose = require('mongoose')

const Goal = require('../models/goalModel')
const User = require('../models/userModel')
const Like = require('../models/likeModel')

// Utility function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id)
}

// @desc    Toggle like on a goal
// @route   POST /api/likes/:goalId
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
    console.log('Toggle Like Request Received');
    console.log('Full Request Details:', {
        params: req.params,
        body: req.body,
        user: req.user ? req.user.id : 'No User',
        headers: req.headers
    });

    const { goalId } = req.params;

    // Validate goalId
    if (!isValidObjectId(goalId)) {
        console.error('Invalid Goal ID format:', goalId);
        res.status(400);
        throw new Error('Invalid Goal ID format');
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
        console.error('User not authenticated');
        res.status(401);
        throw new Error('Not authorized, no user');
    }

    const userId = req.user.id;

    try {
        // Verify the goal exists
        const goal = await Goal.findById(goalId);
        if (!goal) {
            console.error('Goal not found:', goalId);
            res.status(404);
            throw new Error('Goal not found');
        }

        // Check if the user has already liked this goal
        const existingLike = await Like.findOne({ user: userId, goal: goalId });

        if (existingLike) {
            // If like exists, remove it (unlike)
            await existingLike.deleteOne();
            console.log('Like removed successfully');
            return res.status(200).json({ 
                liked: false, 
                goalId: goalId,
                message: 'Unliked successfully' 
            });
        } else {
            // If no like exists, create one
            const like = await Like.create({
                user: userId,
                goal: goalId
            });
            console.log('Like added successfully');
            return res.status(200).json({ 
                liked: true, 
                goalId: goalId,
                message: 'Liked successfully' 
            });
        }
    } catch (error) {
        console.error('Comprehensive Error in toggleLike:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        // Handle specific mongoose errors
        if (error.name === 'ValidationError') {
            res.status(400);
            throw new Error('Invalid data: ' + error.message);
        }

        res.status(500);
        throw new Error('Server error processing like: ' + error.message);
    }
});

// @desc    Check if user liked a goal
// @route   GET /api/likes/:goalId
// @access  Private
const checkLike = asyncHandler(async (req, res) => {
    console.log('Check Like Request Received');
    const { goalId } = req.params;

    // Validate goalId
    if (!isValidObjectId(goalId)) {
        console.error('Invalid Goal ID format:', goalId);
        res.status(400);
        throw new Error('Invalid Goal ID format');
    }

    // Ensure user is authenticated
    if (!req.user || !req.user.id) {
        console.error('User not authenticated');
        res.status(401);
        throw new Error('Not authorized, no user');
    }

    const userId = req.user.id;

    try {
        const like = await Like.findOne({ user: userId, goal: goalId });
        
        res.status(200).json({ 
            liked: !!like, 
            goalId: goalId 
        });
    } catch (error) {
        console.error('Error checking like:', error);
        res.status(500);
        throw new Error('Server error checking like: ' + error.message);
    }
});

// @desc    Get likes count for a goal
// @route   GET /api/likes/count/:goalId
// @access  Public
const getLikesCount = asyncHandler(async (req, res) => {
    console.log('Get Likes Count Request Received');
    const { goalId } = req.params;

    // Validate goalId
    if (!isValidObjectId(goalId)) {
        console.error('Invalid Goal ID format:', goalId);
        res.status(400);
        throw new Error('Invalid Goal ID format');
    }

    try {
        // Count likes for the goal
        const count = await Like.countDocuments({ goal: goalId });
        
        res.status(200).json({ 
            count, 
            goalId 
        });
    } catch (error) {
        console.error('Error getting likes count:', error);
        res.status(500);
        throw new Error('Server error getting likes count: ' + error.message);
    }
});

// @desc    Get likes count for multiple goals
// @route   POST /api/likes/counts
// @access  Public
const getMultipleLikesCounts = asyncHandler(async (req, res) => {
    console.log('Get Multiple Likes Counts Request Received');
    const { goalIds } = req.body;

    if (!goalIds || !Array.isArray(goalIds)) {
        console.error('Invalid goal IDs:', goalIds);
        res.status(400);
        throw new Error('Goal IDs must be provided as an array');
    }

    try {
        // Validate all goal IDs
        const invalidIds = goalIds.filter(id => !isValidObjectId(id));
        if (invalidIds.length > 0) {
            console.error('Invalid goal IDs:', invalidIds);
            res.status(400);
            throw new Error('Some Goal IDs are invalid: ' + invalidIds.join(', '));
        }

        // Convert to MongoDB ObjectIds
        const objectIds = goalIds.map(id => new mongoose.Types.ObjectId(id));
        
        const counts = await Like.aggregate([
            { $match: { goal: { $in: objectIds } } },
            { $group: { _id: '$goal', count: { $sum: 1 } } }
        ]);

        // Format the response
        const likeCounts = {};
        counts.forEach(item => {
            likeCounts[item._id.toString()] = item.count;
        });

        // Ensure all requested goalIds are in the response
        goalIds.forEach(goalId => {
            if (!likeCounts[goalId]) {
                likeCounts[goalId] = 0;
            }
        });

        res.status(200).json(likeCounts);
    } catch (error) {
        console.error('Error getting multiple likes counts:', error);
        res.status(500);
        throw new Error('Server error getting multiple likes counts: ' + error.message);
    }
});

module.exports = {
    toggleLike,
    checkLike,
    getLikesCount,
    getMultipleLikesCounts
}