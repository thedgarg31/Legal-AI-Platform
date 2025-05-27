const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  getAllLawyers,
  getLawyerById,
  registerLawyer,
  updateLawyer,
  deleteLawyer,
  searchLawyers
} = require('../controllers/lawyerController');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = './uploads/lawyer-documents';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                     file.mimetype === 'application/pdf' ||
                     file.mimetype === 'application/msword' ||
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (JPEG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed'));
    }
  }
});

// Define upload fields for lawyer registration
const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'barCertificate', maxCount: 1 },
  { name: 'educationCertificates', maxCount: 3 }
]);

// Middleware for handling upload errors
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files uploaded.'
      });
    }
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || 'File upload error'
    });
  }
  
  next();
};

// Routes

// GET /api/lawyers - Get all lawyers
router.get('/', getAllLawyers);

// GET /api/lawyers/search - Search lawyers
router.get('/search', searchLawyers);

// GET /api/lawyers/:id - Get lawyer by ID
router.get('/:id', getLawyerById);

// POST /api/lawyers - Register new lawyer (with file uploads)
router.post('/', uploadFields, handleUploadError, registerLawyer);

// PUT /api/lawyers/:id - Update lawyer (with file uploads)
router.put('/:id', uploadFields, handleUploadError, updateLawyer);

// DELETE /api/lawyers/:id - Delete lawyer
router.delete('/:id', deleteLawyer);

// Health check route
router.get('/health/check', (req, res) => {
  res.json({
    success: true,
    message: 'Lawyer routes are working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
