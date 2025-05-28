const express = require('express');
const multer = require('multer');
const path = require('path');
const LawyerVerification = require('../models/LawyerVerification');
const verificationService = require('../services/lawyerVerificationService');

const router = express.Router();

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/lawyer-verification/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG and PDF files are allowed'));
    }
  }
});

// ✅ SUBMIT LAWYER VERIFICATION APPLICATION
router.post('/submit', upload.fields([
  { name: 'aadhaarCard', maxCount: 1 },
  { name: 'panCard', maxCount: 1 },
  { name: 'barCouncilCertificate', maxCount: 1 },
  { name: 'lawDegreeMarksheet', maxCount: 1 },
  { name: 'universityCertificate', maxCount: 1 },
  { name: 'practiceProof', maxCount: 5 },
  { name: 'photograph', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('=== LAWYER VERIFICATION APPLICATION ===');
    
    const {
      fullName, email, phone, aadhaarNumber, panNumber,
      street, city, state, pincode,
      advocateCode, barRegistrationNumber, stateBarCouncil, enrollmentDate,
      university, degreeType, graduationYear, rollNumber
    } = req.body;

    // ✅ VALIDATE REQUIRED FIELDS
    if (!fullName || !email || !phone || !aadhaarNumber || !panNumber || 
        !advocateCode || !barRegistrationNumber || !university) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // ✅ VALIDATE REQUIRED DOCUMENTS
    const requiredDocs = ['aadhaarCard', 'panCard', 'barCouncilCertificate', 
                         'lawDegreeMarksheet', 'universityCertificate', 'photograph'];
    
    for (const doc of requiredDocs) {
      if (!req.files[doc] || req.files[doc].length === 0) {
        return res.status(400).json({
          success: false,
          message: `${doc} is required for verification`
        });
      }
    }

    // ✅ CHECK FOR EXISTING APPLICATION
    const existingApp = await LawyerVerification.findOne({
      $or: [
        { 'personalInfo.email': email },
        { 'personalInfo.aadhaarNumber': aadhaarNumber },
        { 'legalCredentials.advocateCode': advocateCode }
      ]
    });

    if (existingApp) {
      return res.status(400).json({
        success: false,
        message: 'An application already exists with this email, Aadhaar, or advocate code'
      });
    }

    // ✅ CREATE VERIFICATION APPLICATION
    const application = new LawyerVerification({
      personalInfo: {
        fullName, email, phone, aadhaarNumber, panNumber,
        address: { street, city, state, pincode }
      },
      legalCredentials: {
        advocateCode, barRegistrationNumber, stateBarCouncil,
        enrollmentDate: new Date(enrollmentDate),
        lawDegree: { university, degreeType, graduationYear: parseInt(graduationYear), rollNumber }
      },
      documents: {
        aadhaarCard: req.files.aadhaarCard[0].path,
        panCard: req.files.panCard[0].path,
        barCouncilCertificate: req.files.barCouncilCertificate[0].path,
        lawDegreeMarksheet: req.files.lawDegreeMarksheet[0].path,
        universityCertificate: req.files.universityCertificate[0].path,
        practiceProof: req.files.practiceProof ? req.files.practiceProof.map(f => f.path) : [],
        photograph: req.files.photograph[0].path
      },
      verification: {
        status: 'document_review',
        steps: {
          documentUpload: { completed: true, timestamp: new Date() }
        }
      }
    });

    await application.save();

    // ✅ START AUTOMATED VERIFICATION PROCESS
    setTimeout(async () => {
      try {
        await verificationService.performCompleteVerification(application.applicationId);
        console.log(`✅ Automated verification completed for ${application.applicationId}`);
      } catch (error) {
        console.error('Automated verification error:', error);
      }
    }, 5000); // Start verification after 5 seconds

    console.log('✅ Verification application submitted:', application.applicationId);

    res.status(201).json({
      success: true,
      message: 'Verification application submitted successfully',
      applicationId: application.applicationId,
      estimatedTime: '24-48 hours',
      nextSteps: [
        'Document authenticity verification',
        'Aadhaar and PAN validation',
        'Bar Council verification',
        'University degree verification',
        'Final approval'
      ]
    });

  } catch (error) {
    console.error('❌ Verification submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during verification submission'
    });
  }
});

// ✅ CHECK VERIFICATION STATUS
router.get('/status/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    const application = await LawyerVerification.findOne({ applicationId });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      application: {
        applicationId: application.applicationId,
        status: application.verification.status,
        submittedDate: application.createdAt,
        verificationDate: application.verification.verificationDate,
        steps: application.verification.steps,
        aiVerification: application.aiVerification,
        rejectionReason: application.verification.rejectionReason
      }
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking status'
    });
  }
});

// ✅ GET ALL PENDING VERIFICATIONS (Admin)
router.get('/admin/pending', async (req, res) => {
  try {
    const pendingApps = await LawyerVerification.find({
      'verification.status': { $in: ['pending', 'document_review', 'bar_council_verification'] }
    }).select('applicationId personalInfo.fullName personalInfo.email verification.status createdAt');

    res.json({
      success: true,
      applications: pendingApps,
      count: pendingApps.length
    });

  } catch (error) {
    console.error('❌ Admin pending list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending applications'
    });
  }
});

module.exports = router;
