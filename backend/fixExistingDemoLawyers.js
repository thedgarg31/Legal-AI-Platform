const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const fixExistingDemoLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== FIXING EXISTING DEMO LAWYERS ===');
    console.log('This is a ONE-TIME fix for demo lawyers only.');
    console.log('Future lawyers will be handled automatically.\n');
    
    // ✅ Fix only existing demo lawyers
    const demoLawyers = [
      {
        email: 'lawyer1@legalpro.com',
        name: 'Dr. Rajesh Kumar',
        password: 'lawyer123',
        specializations: ['Corporate Law', 'Contract Law', 'Business Law'],
        experience: 8,
        fees: 3000
      },
      {
        email: 'lawyer2@legalpro.com',
        name: 'Advocate Priya Sharma',
        password: 'lawyer456',
        specializations: ['Criminal Law', 'Civil Rights', 'Family Law'],
        experience: 12,
        fees: 4500
      }
    ];
    
    for (const demo of demoLawyers) {
      console.log(`\n🔧 Fixing ${demo.name}...`);
      
      // Check if lawyer record exists
      let lawyer = await Lawyer.findOne({ 'personalInfo.email': demo.email });
      if (!lawyer) {
        // Create lawyer record
        lawyer = new Lawyer({
          personalInfo: {
            fullName: demo.name,
            email: demo.email,
            password: await bcrypt.hash(demo.password, 12),
            phone: '+91-9876543210'
          },
          credentials: {
            advocateCode: demo.email === 'lawyer1@legalpro.com' ? 'ADV001' : 'ADV002',
            specializations: demo.specializations,
            experience: demo.experience
          },
          availability: {
            isOnline: true,
            consultationFees: demo.fees
          }
        });
        await lawyer.save();
        console.log(`✅ Created lawyer record: ${lawyer._id}`);
      } else {
        console.log(`✅ Lawyer record exists: ${lawyer._id}`);
      }
      
      // Update/create user record
      await User.findOneAndUpdate(
        { email: demo.email },
        { 
          name: demo.name,
          userType: 'lawyer',
          lawyerId: lawyer._id,
          password: await bcrypt.hash(demo.password, 12)
        },
        { upsert: true }
      );
      console.log(`✅ Updated user record with lawyer ID: ${lawyer._id}`);
    }
    
    console.log('\n🎉 Demo lawyers fixed!');
    console.log('✅ Future lawyers will be handled automatically through registration.');
    console.log('✅ No more manual scripts needed.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing demo lawyers:', error);
    process.exit(1);
  }
};

fixExistingDemoLawyers();
