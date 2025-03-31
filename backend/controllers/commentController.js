const asyncHandler = require('express-async-handler')

const Goal = require('../models/goalModel')
const User = require('../models/userModel')
const Comment = require('../models/commentModel')
// @desc    Get comments
// @route   GET /api/comments
// @access  Public
const getComments = asyncHandler(async (req,res) =>{
    const comments = await Comment.find();
    res.status(200).json(comments);
})

// @desc    Set comments
// @route   POST /api/comments
// @access  Private
const setComments = asyncHandler(async (req,res) =>{
    if(!req.body.text){
        res.status(400)
        throw new Error('Please add a text field')
    }
    const comments = await comments.create({
        user: req.user.id,
        goal: req.goal.id,
        text: req.body.text,
    })

    res.status(200).json(comments)
})

// @desc    Update comments
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req,res) =>{
    const comments = await Comments.findById(req.params.id)

    if(!goal) {
        res.status(400)
        throw new Error('comment not found')
    }

    const user = await User.findById(req.user.id)

    // Check for user
    if(!user) {
        res.status(401)
        throw new Error('User not found')
    }

    //Make sure the logged in user matches the goal user
    if(goal.user.toString() !== user.id) {
        res.status(401)
        throw new Error('User not authorized')
    }

    const updateGoal = await Goal.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
    })    

    res.status(200).json(updateGoal)
})

// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
const deleteGoal = asyncHandler(async (req,res) =>{
    const goal = await Goal.findById(req.params.id)

    if(!goal){
        res.status(400)
        throw new Error('Goal not found')
    }

    const user = await User.findById(req.user.id)

    // Check for user
    if(!user) {
        res.status(401)
        throw new Error('User not found')
    }

    //Make sure the logged in user matches the goal user
    if(goal.user.toString() !== user.id) {
        res.status(401)
        throw new Error('User not authorized')
    }

    await goal.deleteOne()

    res.status(200).json({id: req.params.id })
})

module.exports = {
    getGoals,
    setGoal,
    updateGoal,
    deleteGoal,
}
