const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Lawyer = require('../models/Lawyer');

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

const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'documents', maxCount: 5 },
  { name: 'barCertificate', maxCount: 1 },
  { name: 'educationCertificates', maxCount: 3 }
]);

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

// ✅ ENHANCED: Get all lawyers with smart deduplication
router.get('/', async (req, res) => {
  try {
    console.log('=== GET ALL LAWYERS ===');
    
    // ✅ Get unique lawyers by email, prioritizing online and higher experience
    const lawyers = await Lawyer.aggregate([
      {
        $group: {
          _id: "$personalInfo.email",
          docs: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          bestDoc: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$docs",
                  sortBy: {
                    "availability.isOnline": -1,
                    "credentials.experience": -1
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $replaceRoot: { newRoot: "$bestDoc" }
      },
      {
        $project: {
          "personalInfo.password": 0
        }
      },
      {
        $sort: { "personalInfo.fullName": 1 }
      }
    ]);
    
    console.log(`✅ Found ${lawyers.length} unique lawyers`);
    
    res.json({
      success: true,
      lawyers,
      count: lawyers.length
    });

  } catch (error) {
    console.error('❌ Get all lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lawyers'
    });
  }
});

// ✅ ENHANCED: Get lawyer by ID with validation
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== GET LAWYER BY ID ===');
    console.log('Lawyer ID:', id);
    
    if (!id || id === 'undefined' || id === 'null') {
      console.log('❌ Invalid lawyer ID provided:', id);
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID is required and cannot be undefined'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('❌ Invalid ObjectId format:', id);
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    const lawyer = await Lawyer.findById(id).select('-personalInfo.password');
    
    if (!lawyer) {
      console.log('❌ Lawyer not found with ID:', id);
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    console.log('✅ Lawyer found:', lawyer.personalInfo.fullName);
    
    res.json({
      success: true,
      lawyer
    });

  } catch (error) {
    console.error('❌ Get lawyer by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching lawyer',
      error: error.message
    });
  }
});

// ✅ ENHANCED: Register new lawyer with strict duplicate prevention
router.post('/', uploadFields, handleUploadError, async (req, res) => {
  try {
    console.log('=== REGISTER LAWYER ===');
    
    const lawyerData = req.body;
    
    // ✅ STRICT DUPLICATE PREVENTION
    const existingLawyer = await Lawyer.findOne({
      'personalInfo.email': lawyerData.personalInfo?.email
    });

    if (existingLawyer) {
      console.log('❌ Duplicate lawyer prevented:', lawyerData.personalInfo?.email);
      return res.status(400).json({
        success: false,
        message: 'Lawyer already exists with this email. Please use a different email address.'
      });
    }

    // ✅ VALIDATION
    if (!lawyerData.personalInfo?.fullName || !lawyerData.personalInfo?.email) {
      return res.status(400).json({
        success: false,
        message: 'Full name and email are required'
      });
    }

    const lawyer = new Lawyer(lawyerData);
    await lawyer.save();

    console.log('✅ Lawyer registered:', lawyer.personalInfo.fullName, 'ID:', lawyer._id);

    res.status(201).json({
      success: true,
      lawyer: {
        ...lawyer.toObject(),
        personalInfo: {
          ...lawyer.personalInfo,
          password: undefined
        }
      },
      message: 'Lawyer registered successfully'
    });

  } catch (error) {
    console.error('❌ Register lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during lawyer registration',
      error: error.message
    });
  }
});

// ✅ NEW: Remove specific lawyers by criteria
router.delete('/remove-specific', async (req, res) => {
  try {
    const { criteria } = req.body;
    
    console.log('=== REMOVE SPECIFIC LAWYERS ===');
    console.log('Criteria:', criteria);
    
    if (!criteria || !Array.isArray(criteria)) {
      return res.status(400).json({
        success: false,
        message: 'Criteria array is required'
      });
    }
    
    let totalRemoved = 0;
    const results = [];
    
    for (const criterion of criteria) {
      const result = await Lawyer.deleteOne(criterion);
      totalRemoved += result.deletedCount;
      results.push({
        criterion,
        deleted: result.deletedCount > 0
      });
      
      if (result.deletedCount > 0) {
        console.log('✅ Removed lawyer matching:', criterion);
      } else {
        console.log('❌ No lawyer found matching:', criterion);
      }
    }
    
    console.log(`📊 Total lawyers removed: ${totalRemoved}`);
    
    res.json({
      success: true,
      message: `Removed ${totalRemoved} lawyers`,
      totalRemoved,
      results
    });

  } catch (error) {
    console.error('❌ Remove specific lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing lawyers'
    });
  }
});

// ✅ ENHANCED: Search lawyers
router.get('/search', async (req, res) => {
  try {
    const { specialization, location, experience } = req.query;
    
    console.log('=== SEARCH LAWYERS ===');
    console.log('Search params:', { specialization, location, experience });

    let pipeline = [];

    let matchStage = {};
    if (specialization) {
      matchStage['credentials.specializations'] = { $in: [new RegExp(specialization, 'i')] };
    }
    if (location) {
      matchStage['personalInfo.city'] = new RegExp(location, 'i');
    }
    if (experience) {
      matchStage['credentials.experience'] = { $gte: parseInt(experience) };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    // ✅ Smart deduplication with best lawyer selection
    pipeline.push(
      {
        $group: {
          _id: "$personalInfo.email",
          docs: { $push: "$$ROOT" }
        }
      },
      {
        $project: {
          bestDoc: {
            $arrayElemAt: [
              {
                $sortArray: {
                  input: "$docs",
                  sortBy: {
                    "availability.isOnline": -1,
                    "credentials.experience": -1
                  }
                }
              },
              0
            ]
          }
        }
      },
      {
        $replaceRoot: { newRoot: "$bestDoc" }
      },
      {
        $project: {
          "personalInfo.password": 0
        }
      },
      {
        $sort: { "credentials.experience": -1 }
      }
    );

    const lawyers = await Lawyer.aggregate(pipeline);

    console.log(`✅ Found ${lawyers.length} unique lawyers matching criteria`);

    res.json({
      success: true,
      lawyers,
      count: lawyers.length
    });

  } catch (error) {
    console.error('❌ Search lawyers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching lawyers',
      error: error.message
    });
  }
});

// Health check route
router.get('/health/check', (req, res) => {
  res.json({
    success: true,
    message: 'Lawyer routes are working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET / - Get all unique lawyers (smart deduplication)',
      'GET /:id - Get lawyer by ID',
      'POST / - Register new lawyer (strict duplicate prevention)',
      'DELETE /remove-specific - Remove lawyers by specific criteria',
      'GET /search - Search unique lawyers'
    ]
  });
});

module.exports = router;
