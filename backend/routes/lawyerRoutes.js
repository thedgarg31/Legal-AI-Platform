const express = require('express');
const router = express.Router();
const { 
  addLawyer, 
  getAllLawyers, 
  getLawyerById, 
  updateVerificationStatus, 
  getPendingLawyers,
  updateOnlineStatus,
  upload 
} = require('../controllers/lawyerController');

// Configure multer for multiple file uploads
const uploadFields = upload.fields([
  { name: 'profilePhoto', maxCount: 1 },
  { name: 'enrollmentCertificate', maxCount: 1 },
  { name: 'degreeProof', maxCount: 1 },
  { name: 'identityProof', maxCount: 1 },
  { name: 'addressProof', maxCount: 1 }
]);

// Add a new lawyer (with file uploads)
router.post('/', uploadFields, addLawyer);

// Get all verified lawyers (with optional filters)
router.get('/', getAllLawyers);

// Get pending lawyers for verification (Admin only)
router.get('/pending', getPendingLawyers);

// Get lawyer by ID (for profile view)
router.get('/:id', getLawyerById);

// Update verification status (Admin only)
router.put('/:id/verify', updateVerificationStatus);

// Update online status
router.put('/:id/status', updateOnlineStatus);

module.exports = router;
