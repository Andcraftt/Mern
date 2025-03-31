const asyncHandler = require('express-async-handler')

const Goal = require('../models/goalModel')
const User = require('../models/userModel')
const Comment = require('../models/commentModel')

// @desc    Get comments
// @route   GET /api/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
    const comments = await Comment.find().populate('user', 'name');
    res.status(200).json(comments);
})

// @desc    Get comments by goal
// @route   GET /api/comments/goal/:goalId
// @access  Public
const getCommentsByGoal = asyncHandler(async (req, res) => {
    const comments = await Comment.find({ goal: req.params.goalId }).populate('user', 'name');
    res.status(200).json(comments);
})

// @desc    Set comment
// @route   POST /api/comments
// @access  Private
const setComment = asyncHandler(async (req, res) => {
    if (!req.body.text) {
        res.status(400)
        throw new Error('Please add a text field')
    }

    if (!req.body.goalId) {
        res.status(400)
        throw new Error('Please specify a goal')
    }

    // Verify the goal exists
    const goal = await Goal.findById(req.body.goalId)
    if (!goal) {
        res.status(404)
        throw new Error('Goal not found')
    }

    const comment = await Comment.create({
        user: req.user.id,
        goal: req.body.goalId,
        text: req.body.text,
    })

    res.status(200).json(comment)
})

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
        res.status(400)
        throw new Error('Comment not found')
    }

    const user = await User.findById(req.user.id)

    // Check for user
    if (!user) {
        res.status(401)
        throw new Error('User not found')
    }

    // Make sure the logged in user matches the comment user
    if (comment.user.toString() !== user.id) {
        res.status(401)
        throw new Error('User not authorized')
    }

    const updatedComment = await Comment.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })    

    res.status(200).json(updatedComment)
})

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
    const comment = await Comment.findById(req.params.id)

    if (!comment) {
        res.status(400)
        throw new Error('Comment not found')
    }

    const user = await User.findById(req.user.id)

    // Check for user
    if (!user) {
        res.status(401)
        throw new Error('User not found')
    }

    // Make sure the logged in user matches the comment user
    if (comment.user.toString() !== user.id) {
        res.status(401)
        throw new Error('User not authorized')
    }

    await comment.deleteOne()

    res.status(200).json({ id: req.params.id })
})

module.exports = {
    getComments,
    getCommentsByGoal,
    setComment,
    updateComment,
    deleteComment,
}