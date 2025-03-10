// controllers/uploadController.js
const multer = require('multer');
const axios = require('axios');
const asyncHandler = require('express-async-handler');

// Configura Multer para manejar las cargas de archivos
const storage = multer.memoryStorage();  // Usamos almacenamiento en memoria para las imágenes
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Ruta para subir una imagen a Imgur
const uploadImageToImgur = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Configura los parámetros para la solicitud a Imgur
    const formData = new FormData();
    formData.append('image', req.file.buffer.toString('base64')); // Convertir el buffer a base64

    // Realiza la solicitud a la API de Imgur
    const response = await axios.post('https://api.imgur.com/3/image', formData, {
      headers: {
        'Authorization': `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
        ...formData.getHeaders(), // Agrega los headers de FormData
      },
    });

    // Obtiene la URL de la imagen subida
    const imageUrl = response.data.data.link;

    console.log('Image uploaded successfully:', imageUrl);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('Imgur Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.response ? error.response.data : error.message 
    });
  }
};

module.exports = { upload, uploadImageToImgur };