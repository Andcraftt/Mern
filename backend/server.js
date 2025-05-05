const dotenv = require('dotenv').config();
const path = require('path');
const express = require('express');
const colors = require('colors');
const cors = require('cors');
const { errorHandler } = require('./middleware/errorMiddleware.js');
const connectDB = require('./config/db.js');
const port = process.env.PORT || 5001;

// Initialize the app first
const app = express();

connectDB();

const whitelist = [
  'https://mern-full-stack-hopefully-working.onrender.com',
  'https://pixelup.onrender.com',
  'https://mern-full-stack-1-0.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:5001'
];

// CORS configuration - allow all origins in development mode
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (whitelist.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      // In production, only allow whitelisted origins
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// For JSON body parsing
app.use(express.json({ limit: '10mb' }));

// For URL-encoded bodies (forms)
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Routes
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/likes', require('./routes/likeRoutes'));

// Serve frontend in production
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

// Add a console log to show what port we're trying to bind to
console.log(`Attempting to start server on port ${port}`);

app.listen(port, () => console.log(`Server started on port ${port}`));