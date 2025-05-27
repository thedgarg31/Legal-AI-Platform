const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadDir = './uploads/profiles';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed'));
    }
  }
});

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get user profile
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profile: user.profile,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user profile
router.put('/', verifyToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      bio,
      occupation,
      emergencyContact
    } = req.body;

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update profile fields
    user.profile = {
      ...user.profile,
      firstName: firstName || user.profile?.firstName,
      lastName: lastName || user.profile?.lastName,
      phone: phone || user.profile?.phone,
      dateOfBirth: dateOfBirth || user.profile?.dateOfBirth,
      gender: gender || user.profile?.gender,
      address: address || user.profile?.address,
      bio: bio || user.profile?.bio,
      occupation: occupation || user.profile?.occupation,
      emergencyContact: emergencyContact || user.profile?.emergencyContact,
      profilePhoto: user.profile?.profilePhoto
    };

    // Update main name if firstName/lastName provided
    if (firstName && lastName) {
      user.name = `${firstName} ${lastName}`;
    }

    // Check if profile is completed
    const requiredFields = ['firstName', 'lastName', 'phone'];
    const isCompleted = requiredFields.every(field => user.profile[field]);
    user.profileCompleted = isCompleted;

    await user.save();

    console.log('✅ Profile updated for user:', user.name);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        profile: user.profile,
        profileCompleted: user.profileCompleted
      }
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Upload profile photo
router.post('/photo', verifyToken, upload.single('profilePhoto'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Delete old profile photo if exists
    if (user.profile?.profilePhoto) {
      const oldPhotoPath = path.join(uploadDir, user.profile.profilePhoto);
      if (fs.existsSync(oldPhotoPath)) {
        fs.unlinkSync(oldPhotoPath);
      }
    }

    // Update profile photo
    if (!user.profile) {
      user.profile = {};
    }
    user.profile.profilePhoto = req.file.filename;

    await user.save();

    console.log('✅ Profile photo updated for user:', user.name);

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      profilePhoto: req.file.filename,
      photoUrl: `/uploads/profiles/${req.file.filename}`
    });

  } catch (error) {
    console.error('❌ Upload photo error:', error);
    
    // Clean up uploaded file if error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Delete profile photo
router.delete('/photo', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.profile?.profilePhoto) {
      const photoPath = path.join(uploadDir, user.profile.profilePhoto);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
      
      user.profile.profilePhoto = null;
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile photo deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete photo error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
