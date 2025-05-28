const mongoose = require('mongoose');

const lawyerSchema = new mongoose.Schema({
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pincode: { type: String, default: '' },
      country: { type: String, default: 'India' }
    },
    profilePhoto: String
  },
  credentials: {
    advocateCode: {
      type: String,
      required: true,
      unique: true
    },
    barRegistrationNumber: {
      type: String,
      required: true,
      unique: true
    },
    specializations: [{
      type: String,
      default: ['General Law']
    }],
    experience: {
      type: Number,
      default: 0,
      min: 0
    },
    education: [String],
    certifications: [String]
  },
  availability: {
    isOnline: {
      type: Boolean,
      default: true
    },
    consultationFees: {
      type: Number,
      default: 2500,
      min: 0
    },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' }
    }
  },
  practiceAreas: [String],
  documents: [String]
}, {
  timestamps: true
});

// ✅ INDEX FOR BETTER PERFORMANCE
lawyerSchema.index({ 'personalInfo.email': 1 });
lawyerSchema.index({ 'credentials.advocateCode': 1 });
lawyerSchema.index({ 'credentials.specializations': 1 });

module.exports = mongoose.model('Lawyer', lawyerSchema);
