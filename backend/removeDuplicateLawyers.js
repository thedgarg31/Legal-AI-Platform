const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
require('dotenv').config();

const removeDuplicateLawyers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    console.log('=== REMOVING DUPLICATE LAWYERS ===\n');
    
    // Find duplicates by email and remove offline/older ones
    const duplicates = await Lawyer.aggregate([
      {
        $group: {
          _id: "$personalInfo.email",
          docs: { $push: "$$ROOT" },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    let removedCount = 0;

    for (const duplicate of duplicates) {
      const docs = duplicate.docs;
      console.log(`\n🔍 Found ${docs.length} duplicates for ${docs[0].personalInfo.fullName}`);
      
      // Sort by: 1) Online status (online first), 2) Experience (higher first)
      docs.sort((a, b) => {
        // Prioritize online lawyers
        if (a.availability?.isOnline !== b.availability?.isOnline) {
          return b.availability?.isOnline ? 1 : -1;
        }
        // Then prioritize higher experience
        return (b.credentials?.experience || 0) - (a.credentials?.experience || 0);
      });
      
      // Keep the first (best) lawyer, remove the rest
      const keepLawyer = docs[0];
      const toRemove = docs.slice(1);
      
      console.log(`✅ Keeping: ${keepLawyer.personalInfo.fullName} (${keepLawyer.availability?.isOnline ? 'Online' : 'Offline'}, ${keepLawyer.credentials?.experience || 0} years)`);
      
      for (const lawyer of toRemove) {
        console.log(`❌ Removing: ${lawyer.personalInfo.fullName} (${lawyer.availability?.isOnline ? 'Online' : 'Offline'}, ${lawyer.credentials?.experience || 0} years)`);
        await Lawyer.findByIdAndDelete(lawyer._id);
        removedCount++;
      }
    }
    
    console.log(`\n🎉 Removed ${removedCount} duplicate lawyers`);
    console.log('✅ Each lawyer now has only one record (keeping online and more experienced ones)');
    
    // Show final lawyers
    const finalLawyers = await Lawyer.find({}).select('personalInfo.fullName personalInfo.email availability.isOnline credentials.experience');
    console.log('\n📊 Remaining lawyers:');
    finalLawyers.forEach(lawyer => {
      console.log(`- ${lawyer.personalInfo.fullName}: ${lawyer.availability?.isOnline ? 'Online' : 'Offline'}, ${lawyer.credentials?.experience || 0} years`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error removing duplicates:', error);
    process.exit(1);
  }
};

removeDuplicateLawyers();
