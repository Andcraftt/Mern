const express = require("express");
const router = express.Router();
const { getGoals, setGoal, updateGoal, deleteGoal } = require("../controllers/goalController");
const { uploadImageToS3, upload } = require('../controllers/uploadController'); // Importa el controlador de carga de imágenes
const { protect } = require('../middleware/authMiddleware');

// Ruta para subir una imagen a S3 (solo se usa el middleware de multer para la carga de archivos)
router.post("/upload", upload.single('image'), uploadImageToS3);

// Get all goals
router.get('/', getGoals);

// Create a goal
router.post('/', protect, setGoal);

// Upload route - Make sure this is above other routes with parameters
router.post('/upload', protect, upload.single('image'), uploadImageToS3);

// Update and delete routes
router.put('/:id', protect, updateGoal);
router.delete('/:id', protect, deleteGoal);

module.exports = router;