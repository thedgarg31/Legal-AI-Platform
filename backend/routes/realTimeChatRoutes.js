const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const router = express.Router();

// Create or get existing chat room
router.post('/create-room', async (req, res) => {
  try {
    const { lawyerId, clientId } = req.body;
    
    console.log('=== CREATE CHAT ROOM ===');
    console.log('Lawyer ID:', lawyerId);
    console.log('Client ID:', clientId);

    if (!lawyerId || !clientId) {
      return res.status(400).json({
        success: false,
        message: 'Lawyer ID and Client ID are required'
      });
    }

    const chatRoomId = `chat_${lawyerId}_${clientId}`;

    let chatRoom = await ChatRoom.findOne({ chatRoomId });

    if (chatRoom) {
      console.log('✅ Existing chat room found');
      return res.json({
        success: true,
        chatRoom: {
          chatRoomId: chatRoom.chatRoomId,
          lawyerId: chatRoom.lawyerId,
          clientId: chatRoom.clientId,
          createdAt: chatRoom.createdAt
        }
      });
    }

    chatRoom = new ChatRoom({
      chatRoomId,
      lawyerId,
      clientId,
      participants: [lawyerId, clientId],
      isActive: true
    });

    await chatRoom.save();
    console.log('✅ New chat room created:', chatRoomId);

    res.status(201).json({
      success: true,
      chatRoom: {
        chatRoomId: chatRoom.chatRoomId,
        lawyerId: chatRoom.lawyerId,
        clientId: chatRoom.clientId,
        createdAt: chatRoom.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Create chat room error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating chat room'
    });
  }
});

module.exports = router;
