const express = require('express')
const router = express.Router()
const {
    registerUser,
    loginUser,
    getMe,
    updateUser,
    deleteUser
} = require('../controllers/userController')
const {protect} = require('../middleware/authMiddleware')
const { toggleLike } = require('../controllers/likeController');

router.post('/:goalId', toggleLike);
router.post('/', registerUser)
router.post('/login', loginUser)
router.get('/me', protect, getMe)
router.put('/update', protect, updateUser)
router.delete('/delete', protect, deleteUser)

module.exports = router