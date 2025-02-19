const jwt = require('jsonwebtoken')
const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')

const protect = asyncHandler(async (req, res, next) => {
    // Saltarse la autenticación solo para la ruta GET /api/goals
    if (req.method === 'GET' && req.path === '/api/goals') {
        return next();  // Continúa sin aplicar protección en esta ruta específica
    }

    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Obtener token del encabezado
            token = req.headers.authorization.split(' ')[1]

            // Verificar el token
            const decoded = jwt.verify(token, process.env.JWT_SECRET)

            // Obtener el usuario del token
            req.user = await User.findById(decoded.id).select('-password')

            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error('Not authorized')
        }
    }
    if (!token) {
        res.status(401)
        throw new Error('Not authorized, no token')
    }
})

module.exports = { protect }
