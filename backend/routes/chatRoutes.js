const express = require('express');
const Message = require('../models/Message');
const ChatRoom = require('../models/ChatRoom');
const User = require('../models/User');
const router = express.Router();

// Get chat messages by chatRoomId
router.get('/messages/:chatRoomId', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    
    const messages = await Message.find({ chatRoomId })
      .populate('senderId', 'name email')
      .sort({ timestamp: 1 });
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('❌ Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Save message
router.post('/message', async (req, res) => {
  try {
    const { chatRoomId, senderId, senderType, senderName, message, messageId, timestamp, isDocumentNotification, documentId } = req.body;
    
    const newMessage = new Message({ 
      chatRoomId, 
      senderId, 
      senderType, 
      senderName,
      message, 
      messageId, 
      timestamp: timestamp || new Date(),
      isDocumentNotification: isDocumentNotification || false,
      documentId
    });
    
    await newMessage.save();

    // Update chat room's last message
    await ChatRoom.findOneAndUpdate(
      { chatRoomId },
      { 
        lastMessage: message,
        lastMessageTime: new Date()
      }
    );

    console.log('💾 Message saved to database:', messageId);
    
    res.json({ success: true, message: newMessage });
  } catch (error) {
    console.error('❌ Save message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's chat rooms
router.get('/rooms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;

    let chatRooms;
    
    if (userType === 'client') {
      chatRooms = await ChatRoom.find({ clientId: userId })
        .populate('lawyerId', 'personalInfo.fullName')
        .sort({ lastMessageTime: -1 });
    } else if (userType === 'lawyer') {
      chatRooms = await ChatRoom.find({ lawyerId: userId })
        .populate('clientId', 'name email')
        .sort({ lastMessageTime: -1 });
    }

    res.json({ success: true, chatRooms });
  } catch (error) {
    console.error('❌ Get chat rooms error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
