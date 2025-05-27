const Lawyer = require('../models/Lawyer');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/lawyer-documents/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Add a new lawyer
const addLawyer = async (req, res) => {
  try {
    console.log('=== ADD LAWYER REQUEST ===');
    console.log('Body:', req.body);
    console.log('Files:', req.files);

    const lawyerData = req.body;
    
    // Check if lawyer already exists
    const existingLawyer = await Lawyer.findOne({ 
      $or: [
        { 'personalInfo.email': lawyerData.email },
        { 'credentials.advocateCode': lawyerData.advocateCode }
      ]
    });

    if (existingLawyer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lawyer with this email or advocate code already exists' 
      });
    }

    // Handle file uploads
    const documents = {};
    if (req.files) {
      if (req.files.enrollmentCertificate) documents.enrollmentCertificate = req.files.enrollmentCertificate[0].filename;
      if (req.files.degreeProof) documents.degreeProof = req.files.degreeProof[0].filename;
      if (req.files.identityProof) documents.identityProof = req.files.identityProof[0].filename;
      if (req.files.addressProof) documents.addressProof = req.files.addressProof[0].filename;
      if (req.files.profilePhoto) lawyerData.profilePhoto = req.files.profilePhoto[0].filename;
    }

    // Create lawyer object
    const newLawyer = new Lawyer({
      personalInfo: {
        fullName: lawyerData.fullName,
        email: lawyerData.email,
        phone: lawyerData.phone,
        profilePhoto: lawyerData.profilePhoto,
        address: {
          street: lawyerData.street,
          city: lawyerData.city,
          state: lawyerData.state,
          country: lawyerData.country || 'India',
          zipCode: lawyerData.zipCode
        }
      },
      credentials: {
        advocateCode: lawyerData.advocateCode,
        stateBarCouncil: lawyerData.stateBarCouncil,
        enrollmentDate: lawyerData.enrollmentDate,
        lawDegree: {
          university: lawyerData.university,
          year: lawyerData.graduationYear,
          certificate: documents.degreeProof
        },
        specializations: Array.isArray(lawyerData.specializations) ? lawyerData.specializations : [lawyerData.specializations],
        experience: parseInt(lawyerData.experience),
        courtsPracticing: Array.isArray(lawyerData.courtsPracticing) ? lawyerData.courtsPracticing : [lawyerData.courtsPracticing]
      },
      verification: {
        status: 'pending',
        documents: documents
      },
      availability: {
        isOnline: false,
        consultationFees: parseInt(lawyerData.consultationFees),
        languages: Array.isArray(lawyerData.languages) ? lawyerData.languages : [lawyerData.languages]
      }
    });

    await newLawyer.save();
    console.log('✅ Lawyer added successfully');

    res.json({ 
      success: true, 
      lawyer: newLawyer,
      message: 'Lawyer registration submitted successfully. Verification pending.' 
    });
  } catch (error) {
    console.error('❌ Add lawyer error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all verified lawyers
const getAllLawyers = async (req, res) => {
  try {
    console.log('=== GET ALL LAWYERS ===');
    
    const { specialization, city, minExperience, maxFees } = req.query;
    
    // Build filter query
    let filter = { 'verification.status': 'verified' };
    
    if (specialization) {
      filter['credentials.specializations'] = { $in: [specialization] };
    }
    
    if (city) {
      filter['personalInfo.address.city'] = new RegExp(city, 'i');
    }
    
    if (minExperience) {
      filter['credentials.experience'] = { $gte: parseInt(minExperience) };
    }
    
    if (maxFees) {
      filter['availability.consultationFees'] = { $lte: parseInt(maxFees) };
    }

    const lawyers = await Lawyer.find(filter)
      .select('-verification.documents -personalInfo.address.street -personalInfo.address.zipCode')
      .sort({ 'ratings.averageRating': -1, 'credentials.experience': -1 });

    console.log(`✅ Found ${lawyers.length} lawyers`);
    res.json({ success: true, lawyers });
  } catch (error) {
    console.error('❌ Get lawyers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get lawyer by ID (for profile view)
const getLawyerById = async (req, res) => {
  try {
    console.log('=== GET LAWYER BY ID ===');
    console.log('Lawyer ID:', req.params.id);

    const lawyer = await Lawyer.findById(req.params.id)
      .select('-verification.documents');

    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    console.log('✅ Lawyer found:', lawyer.personalInfo.fullName);
    res.json({ success: true, lawyer });
  } catch (error) {
    console.error('❌ Get lawyer by ID error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update verification status (Admin only)
const updateVerificationStatus = async (req, res) => {
  try {
    console.log('=== UPDATE VERIFICATION STATUS ===');
    
    const { id } = req.params;
    const { status, verifiedBy, rejectionReason } = req.body;

    const lawyer = await Lawyer.findById(id);
    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    lawyer.verification.status = status;
    lawyer.verification.verifiedBy = verifiedBy;
    lawyer.verification.verificationDate = new Date();
    
    if (status === 'rejected' && rejectionReason) {
      lawyer.verification.rejectionReason = rejectionReason;
    }

    await lawyer.save();
    console.log(`✅ Lawyer ${status}:`, lawyer.personalInfo.fullName);

    res.json({ success: true, lawyer, message: `Lawyer ${status} successfully` });
  } catch (error) {
    console.error('❌ Update verification error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get pending lawyers for verification (Admin only)
const getPendingLawyers = async (req, res) => {
  try {
    console.log('=== GET PENDING LAWYERS ===');
    
    const pendingLawyers = await Lawyer.find({ 'verification.status': 'pending' })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${pendingLawyers.length} pending lawyers`);
    res.json({ success: true, lawyers: pendingLawyers });
  } catch (error) {
    console.error('❌ Get pending lawyers error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update lawyer online status
const updateOnlineStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isOnline } = req.body;

    const lawyer = await Lawyer.findById(id);
    if (!lawyer) {
      return res.status(404).json({ success: false, message: 'Lawyer not found' });
    }

    lawyer.availability.isOnline = isOnline;
    await lawyer.save();

    res.json({ success: true, message: `Status updated to ${isOnline ? 'online' : 'offline'}` });
  } catch (error) {
    console.error('❌ Update online status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addLawyer,
  getAllLawyers,
  getLawyerById,
  updateVerificationStatus,
  getPendingLawyers,
  updateOnlineStatus,
  upload
};
