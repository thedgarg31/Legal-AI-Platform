const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const removeDuplicateLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== REMOVING DUPLICATE LAWYERS ===\n');
    
    // Find all lawyers grouped by email
    const allLawyers = await Lawyer.find({});
    const lawyersByEmail = {};
    
    // Group lawyers by email
    allLawyers.forEach(lawyer => {
      const email = lawyer.personalInfo.email;
      if (!lawyersByEmail[email]) {
        lawyersByEmail[email] = [];
      }
      lawyersByEmail[email].push(lawyer);
    });
    
    // Remove duplicates, keeping the first one
    for (const [email, lawyers] of Object.entries(lawyersByEmail)) {
      if (lawyers.length > 1) {
        console.log(`\n🔍 Found ${lawyers.length} duplicates for ${email}`);
        
        // Keep the first lawyer, remove the rest
        const keepLawyer = lawyers[0];
        const duplicatesToRemove = lawyers.slice(1);
        
        console.log(`✅ Keeping: ${keepLawyer.personalInfo.fullName} (ID: ${keepLawyer._id})`);
        
        for (const duplicate of duplicatesToRemove) {
          console.log(`❌ Removing: ${duplicate.personalInfo.fullName} (ID: ${duplicate._id})`);
          await Lawyer.findByIdAndDelete(duplicate._id);
        }
      } else {
        console.log(`✅ No duplicates for ${lawyers[0].personalInfo.fullName}`);
      }
    }
    
    console.log('\n🎉 Duplicate removal completed!');
    console.log('✅ Each lawyer now has only one record');
    
    // Show final count
    const finalCount = await Lawyer.countDocuments();
    console.log(`📊 Total lawyers remaining: ${finalCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    process.exit(1);
  }
};

removeDuplicateLawyers();
