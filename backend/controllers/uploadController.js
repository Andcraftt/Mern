// controllers/uploadController.js
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const asyncHandler = require('express-async-handler');

// Configura Multer para manejar las cargas de archivos
const storage = multer.memoryStorage();  // Usamos almacenamiento en memoria para las imágenes
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configura las credenciales de AWS S3
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: process.env.BUCKET_REGION,
});

// Ruta para subir una imagen a S3
const uploadImageToS3 = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate a unique name for the image
    const params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `${Date.now()}_${req.file.originalname}`, // Unique name
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    };

    // Upload file to S3
    const command = new PutObjectCommand(params);
    await s3.send(command);

    // Create the public URL of the image
    const imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${params.Key}`;
    
    console.log('Image uploaded successfully:', imageUrl);
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image', 
      error: error.message 
    });
  }
};

module.exports = { upload, uploadImageToS3 };