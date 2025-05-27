const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const updateDemoUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update User 1: Dr. Rajesh Kumar
    const hashedPassword1 = await bcrypt.hash('lawyer123', 12);
    await User.findOneAndUpdate(
      { email: 'lawyer1@legalpro.com' },
      { 
        name: 'Dr. Rajesh Kumar',
        email: 'lawyer1@legalpro.com',
        password: hashedPassword1,
        userType: 'lawyer',
        profile: {
          firstName: 'Dr. Rajesh',
          lastName: 'Kumar'
        }
      },
      { upsert: true }
    );

    // Update User 2: Advocate Priya Sharma  
    const hashedPassword2 = await bcrypt.hash('lawyer456', 12);
    await User.findOneAndUpdate(
      { email: 'lawyer2@legalpro.com' },
      { 
        name: 'Advocate Priya Sharma',
        email: 'lawyer2@legalpro.com',
        password: hashedPassword2,
        userType: 'lawyer',
        profile: {
          firstName: 'Advocate Priya',
          lastName: 'Sharma'
        }
      },
      { upsert: true }
    );

    console.log('✅ Updated User 1: Dr. Rajesh Kumar (lawyer1@legalpro.com / lawyer123)');
    console.log('✅ Updated User 2: Advocate Priya Sharma (lawyer2@legalpro.com / lawyer456)');
    
    console.log('\n🎉 Demo users updated successfully!');
    console.log('\nNow when you login with:');
    console.log('- lawyer1@legalpro.com / lawyer123 → You become Dr. Rajesh Kumar');
    console.log('- lawyer2@legalpro.com / lawyer456 → You become Advocate Priya Sharma');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating users:', error);
    process.exit(1);
  }
};

updateDemoUsers();
