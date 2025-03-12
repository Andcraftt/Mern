// controllers/uploadController.js
const multer = require('multer');
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const FormData = require('form-data'); // Make sure to add this dependency

// Configure Multer for file uploads
const storage = multer.memoryStorage();  // Use memory storage for images
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload image to Imgur
const uploadImageToImgur = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create form data for Imgur API request
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64')); // Convert buffer to base64

    // Make request to Imgur API
    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    // Get the uploaded image URL
    const imageUrl = response.data.data.link;

    console.log('Image uploaded successfully:', imageUrl);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Imgur Upload Error:', error.response?.data || error.message);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.response ? error.response.data : error.message 
    });
  }
});

module.exports = { upload, uploadImageToImgur };