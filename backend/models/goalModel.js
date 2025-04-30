const mongoose = require('mongoose')

const goalSchema = mongoose.Schema(
    {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    text: {
        type: String,
        require: [true, 'Please add a text']
    },
    description: {
        type: String,
        require: [true, 'Please add a description']
    },
    imgURL: {
        type: String,
        require: [true, 'Please add a file']
    },
    imgURLpreview: {
        type: String,
        require: [false]
    },
    fileType: {
        type: String,
        default: 'image/jpeg'  // Default for backward compatibility
    },
    fileMetadata: {
        type: String,  // Store as JSON string
        default: '{}'
    },
    category: {
        type: String,
        required: [true, 'Please select a category'],
        enum: ['Videgames', 'Art', 'Food', 'Code', 'Health', 'Web Designs'], // Asegura que sea una categoría válida
    }
    }, 
{
    timestamps: true,
}
)

module.exports = mongoose.model('Goal', goalSchema)