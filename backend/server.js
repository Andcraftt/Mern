import { S3, S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import express from 'express';
import colors from 'colors';
import cors from 'cors';
import { errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db';

dotenv.config();  // Cargar las variables de entorno desde .env
connectDB();

const app = express();

// Configuración de CORS
const corsOptions = {
  origin: 'https://mern-full-stack-hopefully-working.onrender.com',
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// Servir el frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) =>
    res.sendFile(
      path.resolve(__dirname, '../frontend/build', 'index.html')
    )
  );
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}

app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
