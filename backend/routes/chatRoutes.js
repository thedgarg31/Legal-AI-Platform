const express = require('express');
const multer = require('multer');
const { uploadAndPrepareDocument, chatWithDocument } = require('../controllers/chatController');
const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Chat API is working!' });
});

// Upload PDF and prepare for chat
router.post('/upload', upload.single('pdf'), uploadAndPrepareDocument);

// Chat with uploaded document
router.post('/chat', chatWithDocument);

module.exports = router;
