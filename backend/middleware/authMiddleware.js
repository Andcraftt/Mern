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
    // BUT ONLY skip, don't handle the login logic here
    if ((req.method === 'GET' && 
         (req.originalUrl.startsWith('/api/goals') || 
          req.originalUrl.startsWith('/api/comments'))) ||
        (req.method === 'POST' && 
         (req.originalUrl === '/api/users' || 
          req.originalUrl === '/api/users/login'))) {
        console.log('Skipping auth for public route:', req.originalUrl)
        return next();  // Continue without applying protection for these specific routes
    }

    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1]

            if (!token) {
                throw new Error('No token provided')
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            if (!decoded.id) {
                throw new Error('Invalid token structure')
            }

            // Get user from the token
            req.user = await User.findById(decoded.id).select('-password')

            if (!req.user) {
                throw new Error('User not found')
            }

            console.log('Authentication successful for user:', req.user.email)
            next()
        } catch (error) {
            console.log('Authentication error:', error.message)
            res.status(401)
            throw new Error('Not authorized - ' + error.message)
        }
    } else {
        console.log('No authorization header or invalid format')
        res.status(401)
        throw new Error('Not authorized, no token provided')
    }
})

module.exports = { protect }