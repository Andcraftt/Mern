// controllers/uploadController.js
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const asyncHandler = require('express-async-handler');

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
  console.log('hola buenas tardes');
  try {
    // Check if Imgur Client ID is set
    if (!process.env.IMGUR_CLIENT_ID) {
      console.error('IMGUR_CLIENT_ID environment variable is not set');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    
    console.log('Upload request received');
    
    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('File received:', req.file.originalname, req.file.mimetype, req.file.size);

    // Prepare FormData for the image upload
    const form = new FormData();
    form.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    console.log('Making request to Imgur API with Client ID:', 
                process.env.IMGUR_CLIENT_ID.substring(0, 3) + '...');

    // Make request to Imgur API
    const response = await axios({
      method: 'post',
      url: 'https://api.imgur.com/3/upload',
      headers: {
        ...form.getHeaders(),
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`, // Use Client-ID
      },
      data: form
    });

    console.log('Imgur API response status:', response.status);
    
    // Get the uploaded image URL
    const imageUrl = response.data.data.link;

    console.log('Image URL from response:', imageUrl);
    
    if (!imageUrl) {
      console.error('No image URL in response:', response.data);
      return res.status(500).json({ message: 'Failed to get image URL from Imgur' });
    }

    console.log('Image uploaded successfully:', imageUrl);
    
    // Return the image URL
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Imgur Upload Error:');
    if (error.response) {
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response status:', error.response.status);
    } else {
      console.error('Error message:', error.message);
      console.error('Full error:', error);
    }
    
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.response ? JSON.stringify(error.response.data) : error.message 
    });
  }
});

module.exports = { upload, uploadImageToImgur };
