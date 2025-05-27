require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const lawyerRoutes = require('./routes/lawyerRoutes');
const locationRoutes = require('./routes/locationRoutes');
const chatRoutes = require('./routes/chatRoutes');
const realTimeChatRoutes = require('./routes/realTimeChatRoutes');

// Import real-time chat service
const RealTimeChatService = require('./services/realTimeChatService');

// Connect to database (uncomment when ready)
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize real-time chat service
const chatService = new RealTimeChatService(server);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/lawyers', lawyerRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/real-time-chat', realTimeChatRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    onlineUsers: chatService.getOnlineUsersCount()
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: error.message || 'Internal server error'
  });
});

// Handle 404 routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat API: http://localhost:${PORT}/api/chat`);
  console.log(`👨‍💼 Lawyer API: http://localhost:${PORT}/api/lawyers`);
});

module.exports = app;
