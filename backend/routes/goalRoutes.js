const express = require("express");
const router = express.Router();
const { getGoals, setGoal, updateGoal, deleteGoal } = require("../controllers/goalControllers.js")
const { uploadImageToS3, upload } = require('../controllers/uploadController'); // Importa el controlador de carga de imágenes
const { protect } = require('../middleware/authMiddleware');

// Ruta para subir una imagen a S3 (solo se usa el middleware de multer para la carga de archivos)
router.post("/upload", upload.single('image'), uploadImageToS3);

// Rutas para los goals
router.route("/")
  .get(getGoals)              // Obtener todos los goals
  .post(protect, setGoal);     // Crear un nuevo goal (requiere autenticación)

router.route("/:id")
  .delete(protect, deleteGoal) // Eliminar un goal (requiere autenticación)
  .put(protect, updateGoal);    // Actualizar un goal (requiere autenticación)

module.exports = router;
