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

// ✅ ENHANCED: Get all lawyers with duplicate prevention
router.get('/', async (req, res) => {
  try {
    console.log('=== GET ALL LAWYERS ===');
    
    // ✅ DYNAMIC: Get unique lawyers (prevent duplicates by email)
    const lawyers = await Lawyer.aggregate([
      {
        $group: {
          _id: "$personalInfo.email",
          doc: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$doc" }
      },
      {
        $project: {
          "personalInfo.password": 0 // Exclude password
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
    
    // Validate ID
    if (!id || id === 'undefined' || id === 'null') {
      console.log('❌ Invalid lawyer ID provided:', id);
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID is required and cannot be undefined'
      });
    }

    // Validate ObjectId format
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

// ✅ ENHANCED: Register new lawyer with duplicate prevention
router.post('/', uploadFields, handleUploadError, async (req, res) => {
  try {
    console.log('=== REGISTER LAWYER ===');
    
    const lawyerData = req.body;
    
    // ✅ DUPLICATE PREVENTION: Check if lawyer already exists
    const existingLawyer = await Lawyer.findOne({
      'personalInfo.email': lawyerData.personalInfo?.email
    });

    if (existingLawyer) {
      console.log('❌ Duplicate lawyer prevented:', lawyerData.personalInfo?.email);
      return res.status(400).json({
        success: false,
        message: 'Lawyer already exists with this email'
      });
    }

    // ✅ VALIDATION: Ensure required fields
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
          password: undefined // Remove password from response
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

// ✅ ENHANCED: Update lawyer with duplicate prevention
router.put('/:id', uploadFields, handleUploadError, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== UPDATE LAWYER ===');
    console.log('Lawyer ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    // ✅ DUPLICATE PREVENTION: Check if email update would create duplicate
    if (req.body.personalInfo?.email) {
      const existingLawyer = await Lawyer.findOne({
        'personalInfo.email': req.body.personalInfo.email,
        _id: { $ne: id } // Exclude current lawyer
      });

      if (existingLawyer) {
        return res.status(400).json({
          success: false,
          message: 'Another lawyer already exists with this email'
        });
      }
    }

    const updatedLawyer = await Lawyer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).select('-personalInfo.password');

    if (!updatedLawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    console.log('✅ Lawyer updated:', updatedLawyer.personalInfo.fullName);

    res.json({
      success: true,
      lawyer: updatedLawyer,
      message: 'Lawyer updated successfully'
    });

  } catch (error) {
    console.error('❌ Update lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating lawyer',
      error: error.message
    });
  }
});

// ✅ ENHANCED: Delete lawyer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('=== DELETE LAWYER ===');
    console.log('Lawyer ID:', id);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    const deletedLawyer = await Lawyer.findByIdAndDelete(id);

    if (!deletedLawyer) {
      return res.status(404).json({
        success: false,
        message: 'Lawyer not found'
      });
    }

    console.log('✅ Lawyer deleted:', deletedLawyer.personalInfo.fullName);

    res.json({
      success: true,
      message: 'Lawyer deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete lawyer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting lawyer',
      error: error.message
    });
  }
});

// ✅ ENHANCED: Search lawyers with duplicate prevention
router.get('/search', async (req, res) => {
  try {
    const { specialization, location, experience } = req.query;
    
    console.log('=== SEARCH LAWYERS ===');
    console.log('Search params:', { specialization, location, experience });

    let pipeline = [];

    // Match stage
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

    // ✅ DUPLICATE PREVENTION: Group by email to get unique lawyers
    pipeline.push(
      {
        $group: {
          _id: "$personalInfo.email",
          doc: { $first: "$$ROOT" }
        }
      },
      {
        $replaceRoot: { newRoot: "$doc" }
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

// ✅ NEW: Remove duplicates endpoint (admin use)
router.post('/remove-duplicates', async (req, res) => {
  try {
    console.log('=== REMOVING DUPLICATE LAWYERS ===');
    
    // Find duplicates by email
    const duplicates = await Lawyer.aggregate([
      {
        $group: {
          _id: "$personalInfo.email",
          docs: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    let removedCount = 0;

    for (const duplicate of duplicates) {
      const docsToRemove = duplicate.docs.slice(1); // Keep first, remove rest
      
      for (const doc of docsToRemove) {
        await Lawyer.findByIdAndDelete(doc._id);
        removedCount++;
        console.log(`❌ Removed duplicate: ${doc.personalInfo.fullName} (${doc._id})`);
      }
    }

    console.log(`✅ Removed ${removedCount} duplicate lawyers`);

    res.json({
      success: true,
      message: `Removed ${removedCount} duplicate lawyers`,
      removedCount
    });

  } catch (error) {
    console.error('❌ Remove duplicates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing duplicates'
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
      'GET / - Get all unique lawyers',
      'GET /:id - Get lawyer by ID',
      'POST / - Register new lawyer (with duplicate prevention)',
      'PUT /:id - Update lawyer (with duplicate prevention)',
      'DELETE /:id - Delete lawyer',
      'GET /search - Search unique lawyers',
      'POST /remove-duplicates - Remove duplicate lawyers (admin)'
    ]
  });
});

module.exports = router;
