// controllers/uploadController.js
const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const asyncHandler = require('express-async-handler');

// Configura Multer para manejar las cargas de archivos
const storage = multer.memoryStorage();  // Usamos almacenamiento en memoria para las imágenes
const upload = multer({ storage: storage });

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
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // Generar un nombre único para la imagen
  const params = {
    Bucket: process.env.BUCKET_NAME,
    Key: `${Date.now()}_${req.file.originalname}`, // Nombre único
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    ACL: 'public-read', // Permite acceso público
  };

  try {
    // Subir archivo a S3
    await s3.send(new PutObjectCommand(params));

    // Crear la URL pública de la imagen
    const imageUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/${params.Key}`;
    res.status(200).json({ imageUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to upload image', error });
  }
};

module.exports = { upload, uploadImageToS3 };