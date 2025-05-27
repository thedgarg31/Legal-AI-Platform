const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

const router = express.Router();

// Email validation function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Regular User Registration
router.post('/register', [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .trim(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg,
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Check if lawyer exists with this email
    const existingLawyer = await Lawyer.findOne({ 'personalInfo.email': email });
    if (existingLawyer) {
      return res.status(400).json({ 
        success: false, 
        message: 'A lawyer account already exists with this email. Please use the lawyer login.' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword,
      userType: 'client'
    });
    
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: 'client' }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ Client registered:', user.name);

    res.status(201).json({
      success: true,
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        userType: 'client',
        profile: user.profile,
        isLawyer: false
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during registration' 
    });
  }
});

// Lawyer Registration (Join as Lawyer)
router.post('/register-lawyer', async (req, res) => {
  try {
    const { personalInfo, credentials, availability, practiceAreas } = req.body;

    if (!personalInfo?.fullName || !personalInfo?.email || !personalInfo?.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    if (!isValidEmail(personalInfo.email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: personalInfo.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user account already exists with this email. Please use regular login.' 
      });
    }

    // Check if lawyer already exists
    const existingLawyer = await Lawyer.findOne({ 'personalInfo.email': personalInfo.email });
    if (existingLawyer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lawyer already exists with this email' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(personalInfo.password, 12);

    // Create lawyer
    const lawyer = new Lawyer({
      personalInfo: {
        ...personalInfo,
        password: hashedPassword
      },
      credentials: credentials || {},
      availability: availability || { isOnline: true },
      practiceAreas: practiceAreas || []
    });

    await lawyer.save();

    // Also create a User record for unified authentication
    const user = new User({
      name: personalInfo.fullName,
      email: personalInfo.email,
      password: hashedPassword,
      userType: 'lawyer',
      profile: {
        firstName: personalInfo.fullName.split(' ')[0],
        lastName: personalInfo.fullName.split(' ').slice(1).join(' '),
        phone: personalInfo.phone
      }
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, userType: 'lawyer', lawyerId: lawyer._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ Lawyer registered and logged in:', lawyer.personalInfo.fullName);

    res.status(201).json({
      success: true,
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        userType: 'lawyer',
        profile: user.profile,
        isLawyer: true,
        lawyerId: lawyer._id,
        lawyerInfo: {
          specializations: lawyer.credentials.specializations,
          experience: lawyer.credentials.experience,
          consultationFees: lawyer.availability.consultationFees
        }
      },
      message: 'Lawyer account created and logged in successfully'
    });

  } catch (error) {
    console.error('❌ Lawyer register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during lawyer registration' 
    });
  }
});

// Unified Login
router.post('/login', [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: errors.array()[0].msg
      });
    }

    const { email, password } = req.body;

    // First check User collection
    let user = await User.findOne({ email });
    let isLawyer = false;
    let lawyerInfo = null;

    if (!user) {
      // Check Lawyer collection for backward compatibility
      const lawyer = await Lawyer.findOne({ 'personalInfo.email': email });
      if (lawyer) {
        // Create User record if lawyer exists but no User record
        const hashedPassword = lawyer.personalInfo.password;
        user = new User({
          name: lawyer.personalInfo.fullName,
          email: lawyer.personalInfo.email,
          password: hashedPassword,
          userType: 'lawyer'
        });
        await user.save();
        isLawyer = true;
        lawyerInfo = {
          lawyerId: lawyer._id,
          specializations: lawyer.credentials.specializations,
          experience: lawyer.credentials.experience,
          consultationFees: lawyer.availability.consultationFees
        };
      }
    } else if (user.userType === 'lawyer') {
      // Get lawyer info if user is a lawyer
      const lawyer = await Lawyer.findOne({ 'personalInfo.email': email });
      if (lawyer) {
        isLawyer = true;
        lawyerInfo = {
          lawyerId: lawyer._id,
          specializations: lawyer.credentials.specializations,
          experience: lawyer.credentials.experience,
          consultationFees: lawyer.availability.consultationFees
        };
      }
    }

    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Update online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    // Update lawyer online status if applicable
    if (isLawyer && lawyerInfo) {
      await Lawyer.findByIdAndUpdate(lawyerInfo.lawyerId, {
        'availability.isOnline': true
      });
    }

    // Generate JWT token
    const tokenPayload = { 
      id: user._id, 
      userType: user.userType 
    };
    if (lawyerInfo) {
      tokenPayload.lawyerId = lawyerInfo.lawyerId;
    }

    const token = jwt.sign(
      tokenPayload, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in:', user.name, isLawyer ? '(Lawyer)' : '(Client)');

    // In the login route, find the res.json section and replace with:
res.json({
  success: true,
  token,
  user: { 
    id: user._id, 
    name: user.name, 
    email: user.email,
    userType: user.userType,
    profile: user.profile,
    isLawyer: isLawyer,
    ...(lawyerInfo && { 
      lawyerId: lawyerInfo.lawyerId,  // ✅ ENSURE THIS IS INCLUDED
      lawyerInfo: {
        specializations: lawyerInfo.specializations,
        experience: lawyerInfo.experience,
        consultationFees: lawyerInfo.consultationFees
      }
    })
  }
});


  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const { userId, lawyerId } = req.body;
    
    if (userId) {
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date()
      });
    }

    if (lawyerId) {
      await Lawyer.findByIdAndUpdate(lawyerId, {
        'availability.isOnline': false
      });
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('❌ Logout error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Verify token middleware
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

    // Add lawyer info if user is a lawyer
    if (user.userType === 'lawyer' && decoded.lawyerId) {
      const lawyer = await Lawyer.findById(decoded.lawyerId);
      req.lawyer = lawyer;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// Get current user
router.get('/me', verifyToken, (req, res) => {
  const responseUser = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    userType: req.user.userType,
    profile: req.user.profile,
    isLawyer: req.user.userType === 'lawyer'
  };

  if (req.lawyer) {
    responseUser.lawyerId = req.lawyer._id;
    responseUser.lawyerInfo = {
      specializations: req.lawyer.credentials.specializations,
      experience: req.lawyer.credentials.experience,
      consultationFees: req.lawyer.availability.consultationFees
    };
  }

  res.json({
    success: true,
    user: responseUser
  });
});

module.exports = router;
