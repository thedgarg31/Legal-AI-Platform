const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const removeSpecificLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== REMOVING SPECIFIC LAWYERS ===\n');
    
    // Remove Advocate Priya Sharma with 7 years experience
    const result1 = await Lawyer.deleteOne({
      'personalInfo.fullName': 'Advocate Priya Sharma',
      'credentials.experience': 7
    });
    
    if (result1.deletedCount > 0) {
      console.log('✅ Removed: Advocate Priya Sharma (7 years experience)');
    } else {
      console.log('❌ Not found: Advocate Priya Sharma (7 years experience)');
    }
    
    // Remove Dr. Rajesh Kumar with 5 years experience
    const result2 = await Lawyer.deleteOne({
      'personalInfo.fullName': 'Dr. Rajesh Kumar',
      'credentials.experience': 5
    });
    
    if (result2.deletedCount > 0) {
      console.log('✅ Removed: Dr. Rajesh Kumar (5 years experience)');
    } else {
      console.log('❌ Not found: Dr. Rajesh Kumar (5 years experience)');
    }
    
    console.log(`\n📊 Total lawyers removed: ${result1.deletedCount + result2.deletedCount}`);
    
    // Show remaining lawyers
    const remainingLawyers = await Lawyer.find({}).select('personalInfo.fullName credentials.experience availability.isOnline');
    console.log('\n✅ Remaining lawyers:');
    remainingLawyers.forEach(lawyer => {
      console.log(`- ${lawyer.personalInfo.fullName}: ${lawyer.credentials?.experience || 0} years, ${lawyer.availability?.isOnline ? 'Online' : 'Offline'}`);
    });
    
    console.log('\n🎉 Cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing lawyers:', error);
    process.exit(1);
  }
};

removeSpecificLawyers();
