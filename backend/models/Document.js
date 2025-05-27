const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['client', 'lawyer'],
    required: true
  },
  lawyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lawyer',
    required: false  // ✅ CHANGED: Made optional for standalone uploads
  },
  chatRoomId: {
    type: String,
    required: false  // ✅ CHANGED: Made optional for standalone uploads
  },
  extractedText: {
    type: String
  },
  analysis: {
    documentType: String,
    keyPoints: [String],
    legalIssues: [String],
    recommendations: [String],
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High']
    },
    summary: String,
    confidence: Number
  },
  status: {
    type: String,
    enum: ['uploaded', 'processing', 'analyzed', 'error'],
    default: 'uploaded'
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  analysisDate: {
    type: Date
  }
});

module.exports = mongoose.model('Document', documentSchema);
