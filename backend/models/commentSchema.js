const mongoose = require('mongoose')

const goalSchema = mongoose.Schema(
    {
    parentGoal: {
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

module.exports = mongoose.model('Goal',goalSchema)