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
// ✅ DYNAMIC: Enhanced lawyer registration for ANY lawyer
router.post('/register-lawyer', async (req, res) => {
  try {
    const { personalInfo, credentials, availability, practiceAreas } = req.body;

    if (!personalInfo?.fullName || !personalInfo?.email || !personalInfo?.password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: personalInfo.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user account already exists with this email.' 
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

    // ✅ DYNAMIC: Create lawyer record
    const lawyer = new Lawyer({
      personalInfo: {
        ...personalInfo,
        password: hashedPassword
      },
      credentials: credentials || {
        specializations: ['General Law'],
        experience: 0
      },
      availability: availability || { 
        isOnline: true,
        consultationFees: 2000
      },
      practiceAreas: practiceAreas || []
    });

    await lawyer.save();

    // ✅ DYNAMIC: Create User record linked to lawyer
    const user = new User({
      name: personalInfo.fullName,
      email: personalInfo.email,
      password: hashedPassword,
      userType: 'lawyer',
      lawyerId: lawyer._id, // ✅ Automatically linked
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

    console.log('✅ New lawyer registered:', lawyer.personalInfo.fullName, 'ID:', lawyer._id);

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
        lawyerId: lawyer._id.toString(), // ✅ Dynamic lawyer ID
        lawyerInfo: {
          specializations: lawyer.credentials.specializations,
          experience: lawyer.credentials.experience,
          consultationFees: lawyer.availability.consultationFees
        }
      },
      message: 'Lawyer account created successfully'
    });

  } catch (error) {
    console.error('❌ Lawyer register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during lawyer registration' 
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
      lawyerId: lawyer._id, // ✅ Link to lawyer record
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
        lawyerId: lawyer._id.toString(),
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

// ✅ DYNAMIC: Unified Login with proper lawyer ID handling
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

    // Find user in User collection
    let user = await User.findOne({ email });
    let isLawyer = false;
    let lawyerInfo = null;

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

    // ✅ DYNAMIC: Check if user is a lawyer and get lawyer info
    if (user.userType === 'lawyer') {
      isLawyer = true;
      
      // Try to get lawyer info from user.lawyerId first
      let lawyer = null;
      if (user.lawyerId) {
        lawyer = await Lawyer.findById(user.lawyerId);
      } else {
        // Fallback: find by email
        lawyer = await Lawyer.findOne({ 'personalInfo.email': email });
        if (lawyer) {
          // Update user record with lawyer ID for future use
          user.lawyerId = lawyer._id;
          await user.save();
        }
      }

      if (lawyer) {
        lawyerInfo = {
          lawyerId: lawyer._id.toString(),
          specializations: lawyer.credentials?.specializations || [],
          experience: lawyer.credentials?.experience || 0,
          consultationFees: lawyer.availability?.consultationFees || 0
        };
        
        // Update lawyer online status
        await Lawyer.findByIdAndUpdate(lawyer._id, {
          'availability.isOnline': true
        });
      }
    }

    // Update user online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

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
    if (isLawyer && lawyerInfo) {
      console.log('✅ Dynamic Lawyer ID:', lawyerInfo.lawyerId);
    }
    
    // ✅ DYNAMIC: Response with proper lawyer data
    const responseUser = { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      userType: user.userType,
      profile: user.profile,
      isLawyer: isLawyer
    };

    // ✅ Add lawyer-specific data
    if (isLawyer && lawyerInfo) {
      responseUser.lawyerId = lawyerInfo.lawyerId;
      responseUser.lawyerInfo = {
        specializations: lawyerInfo.specializations,
        experience: lawyerInfo.experience,
        consultationFees: lawyerInfo.consultationFees
      };
    }

    res.json({
      success: true,
      token,
      user: responseUser
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
    if (user.userType === 'lawyer' && (decoded.lawyerId || user.lawyerId)) {
      const lawyerId = decoded.lawyerId || user.lawyerId;
      const lawyer = await Lawyer.findById(lawyerId);
      req.lawyer = lawyer;
      req.user.lawyerId = lawyerId;
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

  if (req.lawyer && req.user.lawyerId) {
    responseUser.lawyerId = req.user.lawyerId.toString();
    responseUser.lawyerInfo = {
      specializations: req.lawyer.credentials?.specializations || [],
      experience: req.lawyer.credentials?.experience || 0,
      consultationFees: req.lawyer.availability?.consultationFees || 0
    };
  }

  res.json({
    success: true,
    user: responseUser
  });
});

module.exports = router;
