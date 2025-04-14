const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) => {
    // Log for debugging the route and method
    console.log('Method:', req.method)
    console.log('Original URL:', req.originalUrl)

    // Skip authentication for public routes
    // - GET requests to /api/goals and /api/comments
    // - POST requests to /api/users (registration) and /api/users/login
    if ((req.method === 'GET' && 
         (req.originalUrl.startsWith('/api/goals') || 
          req.originalUrl.startsWith('/api/comments'))) ||
        (req.method === 'POST' && 
         (req.originalUrl === '/api/users' || 
          req.originalUrl === '/api/users/login'))) {
        return next();  // Continue without applying protection for these specific routes
    }

    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password')

            if (!req.user) {
                throw new Error('User not found')
            }

            next()
        } catch (error) {
            console.log('Authentication error:', error.message)
            res.status(401)
            throw new Error('Not authorized')
        }
    } else {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

module.exports = { protect }