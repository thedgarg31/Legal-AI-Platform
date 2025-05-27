const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
require('dotenv').config();

const createDemoLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const demoLawyers = [
      {
        email: 'lawyer1@legalpro.com',
        password: 'lawyer123',
        name: 'Dr. Sarah Johnson',
        specializations: ['Corporate Law', 'Contract Law'],
        experience: 8,
        consultationFees: 3000,
        advocateCode: 'ADV001',
        barRegistrationNumber: 'BAR12345'
      },
      {
        email: 'lawyer2@legalpro.com', 
        password: 'lawyer456',
        name: 'Advocate Michael Chen',
        specializations: ['Criminal Law', 'Civil Rights'],
        experience: 12,
        consultationFees: 4500,
        advocateCode: 'ADV002',
        barRegistrationNumber: 'BAR67890'
      }
    ];

    for (const lawyerData of demoLawyers) {
      // Check if user already exists
      const existingUser = await User.findOne({ email: lawyerData.email });
      if (existingUser) {
        console.log(`User ${lawyerData.email} already exists, skipping...`);
        continue;
      }

      // Check if lawyer already exists
      const existingLawyer = await Lawyer.findOne({ 'personalInfo.email': lawyerData.email });
      if (existingLawyer) {
        console.log(`Lawyer ${lawyerData.email} already exists, skipping...`);
        continue;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(lawyerData.password, 12);

      // Create User record
      const user = new User({
        name: lawyerData.name,
        email: lawyerData.email,
        password: hashedPassword,
        userType: 'lawyer',
        profile: {
          firstName: lawyerData.name.split(' ')[0],
          lastName: lawyerData.name.split(' ').slice(1).join(' ')
        }
      });
      await user.save();

      // Create Lawyer record with proper address object structure
      const lawyer = new Lawyer({
        personalInfo: {
          fullName: lawyerData.name,
          email: lawyerData.email,
          password: hashedPassword,
          phone: '+1234567890',
          // ✅ Address as an object, not a string
          address: {
            street: '123 Legal Street',
            city: 'Law City',
            state: 'Legal State',
            zipCode: '12345',
            country: 'Legal Country'
          }
        },
        credentials: {
          advocateCode: lawyerData.advocateCode,
          barRegistrationNumber: lawyerData.barRegistrationNumber,
          specializations: lawyerData.specializations,
          experience: lawyerData.experience,
          education: 'LLB from Law University',
          certifications: ['Bar Certified']
        },
        availability: {
          isOnline: true,
          consultationFees: lawyerData.consultationFees,
          timeSlots: ['9:00 AM - 12:00 PM', '2:00 PM - 6:00 PM'],
          workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        },
        practiceAreas: ['Legal Consultation', 'Document Review', 'Court Representation']
      });
      await lawyer.save();

      console.log(`✅ Created lawyer: ${lawyerData.name} (${lawyerData.email})`);
      console.log(`   Lawyer ID: ${lawyer._id}`);
      console.log(`   User ID: ${user._id}`);
      console.log(`   Advocate Code: ${lawyerData.advocateCode}`);
    }

    console.log('\n🎉 Demo lawyers created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Lawyer 1: lawyer1@legalpro.com / lawyer123');
    console.log('Lawyer 2: lawyer2@legalpro.com / lawyer456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating demo lawyers:', error);
    process.exit(1);
  }
};

createDemoLawyers();
