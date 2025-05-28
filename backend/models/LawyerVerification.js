const mongoose = require('mongoose');

const lawyerVerificationSchema = new mongoose.Schema({
  applicationId: {
    type: String,
    unique: true,
    default: function() {
      return 'LVR' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
  },
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    aadhaarNumber: { type: String, required: true }, // KYC requirement
    panNumber: { type: String, required: true },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true }
    }
  },
  legalCredentials: {
    advocateCode: { type: String, required: true }, // Bar Council registration
    barRegistrationNumber: { type: String, required: true },
    stateBarCouncil: { type: String, required: true },
    enrollmentDate: { type: Date, required: true },
    lawDegree: {
      university: { type: String, required: true },
      degreeType: { type: String, required: true }, // LLB, LLM, etc.
      graduationYear: { type: Number, required: true },
      rollNumber: { type: String, required: true }
    }
  },
  documents: {
    aadhaarCard: { type: String, required: true }, // File path
    panCard: { type: String, required: true },
    barCouncilCertificate: { type: String, required: true },
    lawDegreeMarksheet: { type: String, required: true },
    universityCertificate: { type: String, required: true },
    practiceProof: [String], // Vakalatnamas, court orders, etc.
    photograph: { type: String, required: true }
  },
  verification: {
    status: {
      type: String,
      enum: ['pending', 'document_review', 'bar_council_verification', 'university_verification', 'approved', 'rejected'],
      default: 'pending'
    },
    steps: {
      documentUpload: { completed: Boolean, timestamp: Date },
      aadhaarVerification: { completed: Boolean, timestamp: Date, verified: Boolean },
      panVerification: { completed: Boolean, timestamp: Date, verified: Boolean },
      barCouncilVerification: { completed: Boolean, timestamp: Date, verified: Boolean },
      universityVerification: { completed: Boolean, timestamp: Date, verified: Boolean },
      practiceVerification: { completed: Boolean, timestamp: Date, verified: Boolean }
    },
    rejectionReason: String,
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
    verificationDate: Date
  },
  aiVerification: {
    documentAuthenticity: {
      aadhaar: { score: Number, status: String, details: Object },
      pan: { score: Number, status: String, details: Object },
      degree: { score: Number, status: String, details: Object }
    },
    faceMatch: {
      aadhaarPhoto: { score: Number, status: String },
      submittedPhoto: { score: Number, status: String }
    },
    fraudDetection: {
      riskScore: Number,
      flags: [String],
      analysis: Object
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LawyerVerification', lawyerVerificationSchema);
