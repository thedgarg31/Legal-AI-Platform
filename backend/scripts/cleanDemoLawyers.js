const mongoose = require('mongoose');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
require('dotenv').config();

const cleanDemoLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Delete existing demo lawyers
    const emails = ['lawyer1@legalpro.com', 'lawyer2@legalpro.com'];
    
    for (const email of emails) {
      await User.deleteOne({ email });
      await Lawyer.deleteOne({ 'personalInfo.email': email });
      console.log(`🗑️ Cleaned up data for: ${email}`);
    }

    console.log('✅ Cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup error:', error);
    process.exit(1);
  }
};

cleanDemoLawyers();
