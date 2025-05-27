const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const fixUserTypes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fix Dr. Rajesh Kumar
    const result1 = await User.findOneAndUpdate(
      { email: 'lawyer1@legalpro.com' },
      { 
        userType: 'lawyer',
        name: 'Dr. Rajesh Kumar'
      },
      { new: true }
    );

    // Fix Advocate Priya Sharma
    const result2 = await User.findOneAndUpdate(
      { email: 'lawyer2@legalpro.com' },
      { 
        userType: 'lawyer',
        name: 'Advocate Priya Sharma'
      },
      { new: true }
    );

    console.log('✅ Fixed Dr. Rajesh Kumar:', result1?.name, result1?.userType);
    console.log('✅ Fixed Advocate Priya Sharma:', result2?.name, result2?.userType);
    
    console.log('\n🎉 User types fixed!');
    console.log('Now when they login, they will be recognized as lawyers.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing user types:', error);
    process.exit(1);
  }
};

fixUserTypes();
