const mongoose = require('mongoose')

const commentSchema = mongoose.Schema(
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
    text: {
        type: String,
        require: [true, 'Please add a text']
    },
    }, 
{
    timestamps: true,
}
)

module.exports = mongoose.model('Comment', commentSchema)