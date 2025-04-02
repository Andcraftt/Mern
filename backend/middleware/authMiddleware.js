const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) => {
    // Log for debugging the route and method
    console.log('Method:', req.method)
    console.log('Original URL:', req.originalUrl)

    // Only skip authentication for public GET routes
    // We still need authentication for protected GET routes like /api/users/me
    if (req.method === 'GET' && 
       (req.originalUrl.startsWith('/api/goals') || 
        req.originalUrl.startsWith('/api/comments'))) {
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

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error('Not authorized')
        }
    } else if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

module.exports = { protect }