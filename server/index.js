const express = require('express');
const cors = require('cors');
const http = require('http');
const helmet = require('helmet');
const connectDB = require('./src/config/db');
const socketManager = require('./src/socket/socketManager');
const Logger = require('./src/utils/logger');
require('dotenv').config();

// Route files
const authRoutes = require('./src/routes/auth');
const patientRoutes = require('./src/routes/patients');
const queueRoutes = require('./src/routes/queue');
const settingsRoutes = require('./src/routes/settings');
const waitingRoomRoutes = require('./src/routes/waitingRoom');
const analyticsRoutes = require('./src/routes/analytics');

const app = express();
const server = http.createServer(app);

// Connect Database
connectDB();

// Initialize Socket.IO
socketManager.init(server);

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: '*', // Customize to client domain in production
    credentials: true
  })
);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request Logging
app.use((req, res, next) => {
  Logger.http(`${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/waiting-room', waitingRoomRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'ClinicFlow API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  Logger.error(`Global Error: ${err.message}`);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
    Logger.info(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app;
