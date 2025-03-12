// controllers/uploadController.js
const multer = require('multer');
const axios = require('axios');
const asyncHandler = require('express-async-handler');
const FormData = require('form-data');

// Configure Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Upload image to Imgur
const uploadImageToImgur = asyncHandler(async (req, res) => {
  try {
    // Log for debugging
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);

    // Create form data for Imgur API request
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64'));
    
    console.log('Making request to Imgur API');
    
    // Make request to Imgur API
    const response = await axios({
      method: 'post',
      url: 'https://api.imgur.com/3/image',
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`
      },
      data: {
        image: req.file.buffer.toString('base64'),
        type: 'base64'
      }
    });

    // Get the uploaded image URL
    const imageUrl = response.data.data.link;

    console.log('Image uploaded successfully:', imageUrl);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Imgur Upload Error:');
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else {
      console.error(error.message);
    }
    
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.response ? JSON.stringify(error.response.data) : error.message 
    });
  }
});

module.exports = { upload, uploadImageToImgur };