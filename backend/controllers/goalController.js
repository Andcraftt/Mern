const asyncHandler = require('express-async-handler')

const Goal = require('../models/goalModel')
const User = require('../models/userModel')

// @desc    Get goals
// @route   GET /api/goals
// @access  Public
const getGoals = asyncHandler(async (req,res) =>{
    const goals = await Goal.find();
    res.status(200).json(goals);
})

// @desc    Set goals
// @route   POST /api/goals
// @access  Private
const setGoal = asyncHandler(async (req,res) =>{
    if(!req.body.text){
        res.status(400)
        throw new Error('Please add a text field')
    }

    if(!req.body.description){
        res.status(400)
        throw new Error('Please add a description')
    }

    if (!req.body.category) {
        res.status(400)
        throw new Error('Please add a category')
    }

    const goal = await Goal.create({
        text: req.body.text,
        description: req.body.description,
        imgURL: req.body.imgURL,
        imgURLpreview: req.body.imgURLpreview || null,
        fileType: req.body.fileType || 'image/jpeg', // Default to image for backward compatibility
        fileMetadata: req.body.fileMetadata || '{}',
        category: req.body.category,
        user: req.user.id,
    })

    res.status(200).json(goal)
})

// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
const updateGoal = asyncHandler(async (req,res) =>{
    const goal = await Goal.findById(req.params.id)

    if(!goal) {
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