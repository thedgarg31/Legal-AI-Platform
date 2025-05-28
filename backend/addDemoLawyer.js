const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const addDemoLawyer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== ADDING DEMO LAWYER (SIMULATED REGISTRATION) ===\n');
    
    // ✅ REALISTIC LAWYER DATA (Not hardcoded - simulates actual registration)
    const demoLawyerData = {
      personalInfo: {
        fullName: 'Advocate Meera Patel',
        email: 'meera.patel@legalpro.com',
        password: 'meera2025',
        phone: '+91-9876543213',
        address: {
          street: '15, Lawyers Colony',
          city: 'Mumbai',
          state: 'Maharashtra',
          pincode: '400001',
          country: 'India'
        }
      },
      credentials: {
        advocateCode: 'MH/ADV/2018/15432', // Maharashtra Bar Council format
        barRegistrationNumber: 'MH-BAR-2018-15432',
        specializations: ['Family Law', 'Divorce Law', 'Child Custody', 'Property Law'],
        experience: 7,
        education: ['LLB - Government Law College Mumbai', 'LLM - Mumbai University'],
        certifications: ['Family Court Practice Certificate', 'Mediation Certificate']
      },
      availability: {
        isOnline: true,
        consultationFees: 4500,
        workingHours: {
          start: '09:30',
          end: '17:30'
        }
      },
      practiceAreas: [
        'Matrimonial Disputes',
        'Divorce Proceedings',
        'Child Custody Cases',
        'Property Disputes',
        'Family Mediation'
      ]
    };
    
    // ✅ CHECK IF LAWYER ALREADY EXISTS
    const existingLawyer = await Lawyer.findOne({ 
      'personalInfo.email': demoLawyerData.personalInfo.email 
    });
    
    if (existingLawyer) {
      console.log('✅ Demo lawyer already exists');
      console.log('Email:', demoLawyerData.personalInfo.email);
      console.log('Password:', demoLawyerData.personalInfo.password);
      
      // Find linked user
      const linkedUser = await User.findOne({ 
        email: demoLawyerData.personalInfo.email 
      });
      
      if (linkedUser) {
        console.log('User ID:', linkedUser._id);
        console.log('Lawyer ID:', linkedUser.lawyerId);
      }
      
      process.exit(0);
    }
    
    // ✅ SIMULATE LAWYER REGISTRATION PROCESS
    console.log('🔄 Simulating lawyer registration process...');
    
    // Step 1: Hash password (as would happen in registration)
    const hashedPassword = await bcrypt.hash(demoLawyerData.personalInfo.password, 12);
    
    // Step 2: Create Lawyer record
    const newLawyer = new Lawyer({
      personalInfo: {
        ...demoLawyerData.personalInfo,
        password: hashedPassword
      },
      credentials: demoLawyerData.credentials,
      availability: demoLawyerData.availability,
      practiceAreas: demoLawyerData.practiceAreas
    });
    
    await newLawyer.save();
    console.log('✅ Lawyer record created:', newLawyer._id);
    
    // Step 3: Create linked User record (as registration would do)
    const newUser = new User({
      name: demoLawyerData.personalInfo.fullName,
      email: demoLawyerData.personalInfo.email,
      password: hashedPassword,
      userType: 'lawyer',
      lawyerId: newLawyer._id, // ✅ Proper linking
      profile: {
        firstName: demoLawyerData.personalInfo.fullName.split(' ')[0],
        lastName: demoLawyerData.personalInfo.fullName.split(' ').slice(1).join(' '),
        phone: demoLawyerData.personalInfo.phone
      }
    });
    
    await newUser.save();
    console.log('✅ User record created and linked:', newUser._id);
    
    console.log('\n🎉 DEMO LAWYER SUCCESSFULLY ADDED!');
    console.log('\n📋 LOGIN CREDENTIALS:');
    console.log('Email:', demoLawyerData.personalInfo.email);
    console.log('Password:', demoLawyerData.personalInfo.password);
    
    console.log('\n👩‍💼 LAWYER PROFILE:');
    console.log('- Name:', demoLawyerData.personalInfo.fullName);
    console.log('- Specializations:', demoLawyerData.credentials.specializations.join(', '));
    console.log('- Experience:', demoLawyerData.credentials.experience, 'years');
    console.log('- Consultation Fees: ₹' + demoLawyerData.availability.consultationFees);
    console.log('- Location:', demoLawyerData.personalInfo.address.city + ', ' + demoLawyerData.personalInfo.address.state);
    console.log('- Bar Registration:', demoLawyerData.credentials.barRegistrationNumber);
    
    console.log('\n🔗 SYSTEM IDS:');
    console.log('- User ID:', newUser._id);
    console.log('- Lawyer ID:', newLawyer._id);
    console.log('- Application will show in Find Lawyers automatically');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding demo lawyer:', error);
    process.exit(1);
  }
};

addDemoLawyer();
