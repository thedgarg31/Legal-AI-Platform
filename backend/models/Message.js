const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatRoomId: { 
    type: String, 
    required: true 
  },
  senderId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },
  senderType: { 
    type: String, 
    enum: ['client', 'lawyer', 'system'], 
    required: true 
  },
  senderName: {
    type: String,
    required: true
  },
  message: { 
    type: String, 
    required: true 
  },
  messageId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  isDocumentNotification: {
    type: Boolean,
    default: false
  },
  documentId: {
    type: String,
    default: null
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
