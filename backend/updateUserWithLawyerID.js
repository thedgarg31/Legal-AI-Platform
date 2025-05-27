const mongoose = require('mongoose');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const updateUserWithLawyerId = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the new lawyer record
    const lawyer = await Lawyer.findOne({ 'personalInfo.email': 'lawyer1@legalpro.com' });
    
    if (!lawyer) {
      console.log('❌ Lawyer not found');
      process.exit(1);
    }

    console.log('✅ Found lawyer with ID:', lawyer._id);

    // Update the User record to link to the new lawyer ID
    const updatedUser = await User.findOneAndUpdate(
      { email: 'lawyer1@legalpro.com' },
      { 
        lawyerId: lawyer._id, 
        userType: 'lawyer',
        name: 'Dr. Rajesh Kumar'
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('✅ Updated User:', updatedUser.name);
    console.log('✅ User Type:', updatedUser.userType);
    console.log('✅ Lawyer ID:', updatedUser.lawyerId);
    
    console.log('\n🎉 User successfully linked to lawyer record!');
    console.log('Now Dr. Rajesh Kumar can access the lawyer dashboard.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating user:', error);
    process.exit(1);
  }
};

updateUserWithLawyerId();
