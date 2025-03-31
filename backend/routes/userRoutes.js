const express = require('express')
const router = express.Router()
const {
    registerUser,
    loginUser,
    getMe,
} = require('../controllers/userController')
const {protect} = require('../middleware/authMiddleware')

router.post('/', protect, registerUser)
router.post('/login', protect, loginUser)
router.get('/me', protect, getMe)

module.exports = router