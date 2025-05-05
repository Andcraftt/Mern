const mongoose = require('mongoose')

const likeSchema = mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    goal: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Goal',
    },
    }, 
    {
        timestamps: true,
    }
)

// Compound index to ensure a user can only like a goal once
likeSchema.index({ user: 1, goal: 1 }, { unique: true });

module.exports = mongoose.model('Like', likeSchema)