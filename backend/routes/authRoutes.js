const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');

const router = express.Router();

// ✅ ENHANCED: Dynamic Lawyer Registration (Real Registration Flow)
router.post('/register-lawyer', [
  body('personalInfo.fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('personalInfo.email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('personalInfo.password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
    
  body('personalInfo.phone')
    .matches(/^[+]?[1-9][\d\s\-()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
    
  body('credentials.advocateCode')
    .notEmpty()
    .withMessage('Advocate code is required'),
    
  body('credentials.barRegistrationNumber')
    .notEmpty()
    .withMessage('Bar registration number is required')
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

    const { personalInfo, credentials, availability, practiceAreas } = req.body;

    console.log('=== NEW LAWYER REGISTRATION ===');
    console.log('Name:', personalInfo.fullName);
    console.log('Email:', personalInfo.email);

    // ✅ DUPLICATE PREVENTION
    const existingUser = await User.findOne({ email: personalInfo.email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'A user account already exists with this email.' 
      });
    }

    const existingLawyer = await Lawyer.findOne({ 
      $or: [
        { 'personalInfo.email': personalInfo.email },
        { 'credentials.advocateCode': credentials.advocateCode },
        { 'credentials.barRegistrationNumber': credentials.barRegistrationNumber }
      ]
    });
    
    if (existingLawyer) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lawyer already exists with this email, advocate code, or bar registration number' 
      });
    }

    // ✅ HASH PASSWORD
    const hashedPassword = await bcrypt.hash(personalInfo.password, 12);

    // ✅ CREATE LAWYER RECORD WITH PROPER DEFAULTS
    const lawyer = new Lawyer({
      personalInfo: {
        ...personalInfo,
        password: hashedPassword,
        address: personalInfo.address || {
          street: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        }
      },
      credentials: {
        advocateCode: credentials.advocateCode,
        barRegistrationNumber: credentials.barRegistrationNumber,
        specializations: credentials.specializations || ['General Law'],
        experience: credentials.experience || 0,
        education: credentials.education || [],
        certifications: credentials.certifications || []
      },
      availability: {
        isOnline: availability?.isOnline !== undefined ? availability.isOnline : true,
        consultationFees: availability?.consultationFees || 2500,
        workingHours: availability?.workingHours || {
          start: '09:00',
          end: '18:00'
        }
      },
      practiceAreas: practiceAreas || []
    });

    await lawyer.save();

    // ✅ CREATE LINKED USER RECORD
    const user = new User({
      name: personalInfo.fullName,
      email: personalInfo.email,
      password: hashedPassword,
      userType: 'lawyer',
      lawyerId: lawyer._id, // ✅ Automatic linking
      profile: {
        firstName: personalInfo.fullName.split(' ')[0],
        lastName: personalInfo.fullName.split(' ').slice(1).join(' '),
        phone: personalInfo.phone
      }
    });

    await user.save();

    // ✅ GENERATE JWT TOKEN
    const token = jwt.sign(
      { id: user._id, userType: 'lawyer', lawyerId: lawyer._id }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ New lawyer registered successfully:', lawyer.personalInfo.fullName);
    console.log('✅ Lawyer ID:', lawyer._id);
    console.log('✅ User ID:', user._id);

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
          consultationFees: lawyer.availability.consultationFees,
          advocateCode: lawyer.credentials.advocateCode
        }
      },
      message: 'Lawyer account created successfully'
    });

  } catch (error) {
    console.error('❌ Lawyer registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during lawyer registration' 
    });
  }
});

// ✅ ENHANCED: Dynamic Login with proper lawyer ID resolution
router.post('/login', [
  body('email').isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required')
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
    let user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    let isLawyer = false;
    let lawyerInfo = null;

    // ✅ DYNAMIC: Handle any lawyer, not hardcoded
    if (user.userType === 'lawyer') {
      isLawyer = true;
      
      let lawyer = null;
      if (user.lawyerId) {
        lawyer = await Lawyer.findById(user.lawyerId);
      } else {
        // Auto-link if missing
        lawyer = await Lawyer.findOne({ 'personalInfo.email': email });
        if (lawyer) {
          user.lawyerId = lawyer._id;
          await user.save();
          console.log(`✅ Auto-linked ${user.name} to lawyer ID: ${lawyer._id}`);
        }
      }

      if (lawyer) {
        lawyerInfo = {
          lawyerId: lawyer._id.toString(),
          specializations: lawyer.credentials?.specializations || [],
          experience: lawyer.credentials?.experience || 0,
          consultationFees: lawyer.availability?.consultationFees || 0,
          advocateCode: lawyer.credentials?.advocateCode
        };
        
        // Update online status
        await Lawyer.findByIdAndUpdate(lawyer._id, {
          'availability.isOnline': true
        });
        
        console.log(`✅ Lawyer login: ${lawyer.personalInfo.fullName} (ID: ${lawyer._id})`);
      }
    }

    // Update user online status
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        id: user._id, 
        userType: user.userType,
        ...(lawyerInfo && { lawyerId: lawyerInfo.lawyerId })
      }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '7d' }
    );

    console.log('✅ User logged in:', user.name, isLawyer ? '(Lawyer)' : '(Client)');
    
    const responseUser = { 
      id: user._id, 
      name: user.name, 
      email: user.email,
      userType: user.userType,
      profile: user.profile,
      isLawyer: isLawyer
    };

    if (isLawyer && lawyerInfo) {
      responseUser.lawyerId = lawyerInfo.lawyerId;
      responseUser.lawyerInfo = lawyerInfo;
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

// Rest of auth routes remain the same...
module.exports = router;
