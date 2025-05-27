const mongoose = require('mongoose');
require('dotenv').config();

// Import your Lawyer model
const Lawyer = require('../models/Lawyer');

// Demo lawyer data
const demoLawyers = [
  {
    personalInfo: {
      fullName: "Dr. Rajesh Kumar",
      email: "demo.lawyer@legalai.com",
      phone: "+919876543210",
      profilePhoto: "",
      address: {
        street: "123 Legal Street",
        city: "New Delhi",
        state: "Delhi",
        country: "India",
        zipCode: "110001"
      }
    },
    credentials: {
      advocateCode: "DL/2020/12345",
      stateBarCouncil: "Bar Council of Delhi",
      enrollmentDate: new Date("2020-01-15"),
      lawDegree: {
        university: "Delhi University",
        year: 2019,
        certificate: ""
      },
      specializations: ["Criminal Law", "Civil Law", "Corporate Law"],
      experience: 5,
      courtsPracticing: ["Supreme Court", "High Court", "District Court"]
    },
    verification: {
      status: "verified",
      verifiedBy: "Admin",
      verificationDate: new Date("2023-01-01"),
      documents: {}
    },
    availability: {
      isOnline: true,
      consultationFees: 2000,
      availableHours: {},
      languages: ["English", "Hindi", "Punjabi"]
    },
    ratings: {
      averageRating: 4.5,
      totalReviews: 25,
      reviews: []
    }
  },
  {
    personalInfo: {
      fullName: "Advocate Priya Sharma",
      email: "priya.sharma@legalai.com",
      phone: "+919876543211",
      profilePhoto: "",
      address: {
        street: "456 Justice Avenue",
        city: "Mumbai",
        state: "Maharashtra",
        country: "India",
        zipCode: "400001"
      }
    },
    credentials: {
      advocateCode: "MH/2018/67890",
      stateBarCouncil: "Bar Council of Maharashtra",
      enrollmentDate: new Date("2018-06-20"),
      lawDegree: {
        university: "Mumbai University",
        year: 2017,
        certificate: ""
      },
      specializations: ["Family Law", "Property Law", "Civil Law"],
      experience: 7,
      courtsPracticing: ["High Court", "District Court", "Sessions Court"]
    },
    verification: {
      status: "verified",
      verifiedBy: "Admin",
      verificationDate: new Date("2023-01-01"),
      documents: {}
    },
    availability: {
      isOnline: false,
      consultationFees: 1500,
      availableHours: {},
      languages: ["English", "Hindi", "Marathi"]
    },
    ratings: {
      averageRating: 4.2,
      totalReviews: 18,
      reviews: []
    }
  },
  {
    personalInfo: {
      fullName: "Senior Advocate Vikram Singh",
      email: "vikram.singh@legalai.com",
      phone: "+919876543212",
      profilePhoto: "",
      address: {
        street: "789 Constitution Road",
        city: "Bangalore",
        state: "Karnataka",
        country: "India",
        zipCode: "560001"
      }
    },
    credentials: {
      advocateCode: "KA/2015/11111",
      stateBarCouncil: "Bar Council of Karnataka",
      enrollmentDate: new Date("2015-03-10"),
      lawDegree: {
        university: "National Law School of India University",
        year: 2014,
        certificate: ""
      },
      specializations: ["Constitutional Law", "Criminal Law", "Tax Law"],
      experience: 10,
      courtsPracticing: ["Supreme Court", "High Court"]
    },
    verification: {
      status: "verified",
      verifiedBy: "Admin",
      verificationDate: new Date("2023-01-01"),
      documents: {}
    },
    availability: {
      isOnline: true,
      consultationFees: 3500,
      availableHours: {},
      languages: ["English", "Hindi", "Kannada"]
    },
    ratings: {
      averageRating: 4.8,
      totalReviews: 42,
      reviews: []
    }
  }
];

// Function to seed demo lawyers
const seedDemoLawyers = async () => {
  try {
    console.log('🔄 Starting seeding process...');
    
    // Connect to MongoDB using the same connection string as your app
    const connectionString = process.env.MONGODB_URI || 'mongodb+srv://aryanbalhara150:FRL1bHAs8VdhH0GR@cluster0.zrt9cjg.mongodb.net/legal_affairs_platform?retryWrites=true&w=majority&appName=Cluster0';
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(connectionString);
    console.log('✅ Connected to MongoDB successfully');

    // Check existing lawyers
    const existingCount = await Lawyer.countDocuments();
    console.log('📊 Existing lawyers in database:', existingCount);

    // Clear existing demo lawyers (optional)
    const deleteResult = await Lawyer.deleteMany({ 
      'personalInfo.email': { $in: demoLawyers.map(l => l.personalInfo.email) }
    });
    console.log('🗑️ Cleared existing demo lawyers:', deleteResult.deletedCount);

    // Insert new demo lawyers with proper error handling
    console.log('📝 Inserting demo lawyers...');
    const insertedLawyers = await Lawyer.insertMany(demoLawyers, { ordered: false });
    console.log('🎉 Demo lawyers added successfully!');
    
    insertedLawyers.forEach((lawyer, index) => {
      console.log(`${index + 1}. ${lawyer.personalInfo.fullName}`);
      console.log(`   ID: ${lawyer._id}`);
      console.log(`   Email: ${lawyer.personalInfo.email}`);
      console.log(`   Status: ${lawyer.verification.status}`);
      console.log(`   Online: ${lawyer.availability.isOnline ? 'Yes' : 'No'}`);
      console.log(`   Specializations: ${lawyer.credentials.specializations.join(', ')}`);
      console.log('');
    });

    // Verify the insertion
    const finalCount = await Lawyer.countDocuments();
    console.log('📊 Total lawyers after seeding:', finalCount);

    // Verify specific demo lawyers
    const verifyLawyers = await Lawyer.find({ 
      'personalInfo.email': { $in: demoLawyers.map(l => l.personalInfo.email) }
    });
    console.log('✅ Verification - Found demo lawyers:', verifyLawyers.length);

    await mongoose.connection.close();
    console.log('📊 Database connection closed');
    console.log('🎉 Seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding demo lawyers:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
};

// Run the seeding function
seedDemoLawyers();
