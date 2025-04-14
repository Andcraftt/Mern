const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const Goal = require('../models/goalModel')
const Comment = require('../models/commentModel')

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body

    if(!name || !email || !password) {
        res.status(400)
        throw new Error('Please add all fields')
    }

    //Check if user exists
    const userExists = await User.findOne({email})

    if(userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    if(user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Invalid user data')
    }
})

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body

    // Check for user email
    const user = await User.findOne({email})

    if(user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id),
        })
    } else {
        res.status(400)
        throw new Error('Invalid credentials')
    }
})

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    const {_id, name, email} = await User.findById(req.user.id)

    res.status(200).json({
        id: _id,
        name,
        email,
    })
})

// @desc    Update user
// @route   PUT /api/users/update
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check if current password is correct
    const { currentPassword, name, email, password } = req.body

    if (!currentPassword) {
        res.status(400)
        throw new Error('Please enter your current password to make changes')
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordCorrect) {
        res.status(400)
        throw new Error('Current password is incorrect')
    }

    // Check if email is already in use (if changing email)
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email })
        if (emailExists) {
            res.status(400)
            throw new Error('Email already in use')
        }
    }

    // Update user
    user.name = name || user.name
    user.email = email || user.email

    // Update password if provided
    if (password) {
        // Hash new password
        const salt = await bcrypt.genSalt(10)
        user.password = await bcrypt.hash(password, salt)
    }

    const updatedUser = await user.save()

    res.status(200).json({
        _id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        token: generateToken(updatedUser._id)
    })
})

// @desc    Delete user
// @route   DELETE /api/users/delete
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id)

    if (!user) {
        res.status(404)
        throw new Error('User not found')
    }

    // Check if current password is correct
    const { currentPassword } = req.body

    if (!currentPassword) {
        res.status(400)
        throw new Error('Please enter your current password to delete your account')
    }

    const isPasswordCorrect = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordCorrect) {
        res.status(400)
        throw new Error('Current password is incorrect')
    }

    // Delete all user's goals
    await Goal.deleteMany({ user: req.user.id })
    
    // Delete all user's comments
    await Comment.deleteMany({ user: req.user.id })

    // Delete user
    await user.deleteOne()

    res.status(200).json({ message: 'User deleted successfully' })
})

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,{
        expiresIn: '30d',
    })
}

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateUser,
    deleteUser,
}