const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
  chatRoomId: { type: String, required: true },
  lawyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lawyer', required: true },
  clientId: { type: String, required: true },
  messages: [{
    messageId: String,
    senderId: String,
    senderType: { type: String, enum: ['lawyer', 'client'] },
    message: String,
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  startTime: { type: Date, default: Date.now },
  endTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Chat', ChatSchema);
