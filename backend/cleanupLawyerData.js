const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const cleanupLawyerData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== LAWYER DATA CLEANUP ===\n');
    
    // Step 1: Remove specific unwanted lawyers
    console.log('Step 1: Removing specific lawyers...');
    
    const removeTargets = [
      {
        'personalInfo.fullName': 'Advocate Priya Sharma',
        'credentials.experience': 7
      },
      {
        'personalInfo.fullName': 'Dr. Rajesh Kumar',
        'credentials.experience': 5
      }
    ];
    
    let totalRemoved = 0;
    for (const target of removeTargets) {
      const result = await Lawyer.deleteOne(target);
      if (result.deletedCount > 0) {
        console.log(`✅ Removed: ${target['personalInfo.fullName']} (${target['credentials.experience']} years)`);
        totalRemoved++;
      } else {
        console.log(`❌ Not found: ${target['personalInfo.fullName']} (${target['credentials.experience']} years)`);
      }
    }
    
    // Step 2: Ensure remaining lawyers have proper data
    console.log('\nStep 2: Updating remaining lawyers...');
    
    const allLawyers = await Lawyer.find({});
    for (const lawyer of allLawyers) {
      let updated = false;
      const updates = {};
      
      // Ensure online status is properly set
      if (lawyer.availability?.isOnline === undefined) {
        updates['availability.isOnline'] = true;
        updated = true;
      }
      
      // Ensure experience is a number
      if (typeof lawyer.credentials?.experience !== 'number') {
        updates['credentials.experience'] = parseInt(lawyer.credentials?.experience) || 0;
        updated = true;
      }
      
      if (updated) {
        await Lawyer.findByIdAndUpdate(lawyer._id, updates);
        console.log(`✅ Updated: ${lawyer.personalInfo.fullName}`);
      }
    }
    
    // Step 3: Show final results
    console.log('\nStep 3: Final lawyer list...');
    const finalLawyers = await Lawyer.find({}).select('personalInfo.fullName personalInfo.email credentials.experience availability.isOnline');
    
    console.log(`\n📊 Total lawyers after cleanup: ${finalLawyers.length}`);
    finalLawyers.forEach((lawyer, index) => {
      console.log(`${index + 1}. ${lawyer.personalInfo.fullName} (${lawyer.personalInfo.email})`);
      console.log(`   Experience: ${lawyer.credentials?.experience || 0} years`);
      console.log(`   Status: ${lawyer.availability?.isOnline ? 'Online' : 'Offline'}`);
      console.log('   ---');
    });
    
    console.log('\n🎉 Cleanup completed successfully!');
    console.log(`✅ Removed ${totalRemoved} unwanted lawyers`);
    console.log(`✅ ${finalLawyers.length} lawyers remaining`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
};

cleanupLawyerData();
