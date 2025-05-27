const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    profilePhoto: String,
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  credentials: {
    advocateCode: { type: String, required: true, unique: true },
    stateBarCouncil: String,
    enrollmentDate: Date,
    lawDegree: {
      university: String,
      year: Number,
      certificate: String
    },
    specializations: [String],
    experience: Number,
    courtsPracticing: [String]
  },
  verification: {
    status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    verifiedBy: String,
    verificationDate: Date,
    documents: {
      enrollmentCertificate: String,
      degreeProof: String,
      identityProof: String,
      addressProof: String
    }
  },
  availability: {
    isOnline: { type: Boolean, default: false },
    consultationFees: Number,
    availableHours: Object,
    languages: [String]
  },
  ratings: {
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    reviews: [{
      userId: mongoose.Schema.Types.ObjectId,
      rating: Number,
      comment: String,
      date: Date
    }]
  }
}, { timestamps: true });

module.exports = mongoose.model('Lawyer', LawyerSchema);
