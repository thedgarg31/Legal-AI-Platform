const express = require('express');
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');
const Lawyer = require('../models/Lawyer');
const mongoose = require('mongoose');

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

    // Generate chat room ID
    const chatRoomId = `chat_${lawyerId}_${clientId}`;

    // Check if chat room already exists
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

    // Create new chat room
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

// ✅ NEW: Resolve active lawyer ID for dynamic routing
router.get('/resolve-lawyer-id/:email', async (req, res) => {
  try {
    const { email } = req.params;
    console.log('🔍 Resolving active lawyer ID for:', email);
    
    // Find all possible lawyer IDs for this email
    const user = await User.findOne({ email, userType: 'lawyer' });
    const lawyers = await Lawyer.find({ 'personalInfo.email': email });
    
    const possibleIds = [user?.lawyerId, ...lawyers.map(l => l._id)].filter(Boolean);
    console.log('📋 Possible lawyer IDs:', possibleIds.map(id => id.toString()));
    
    // Find which lawyer ID has the most chat activity
    let activeLawyerId = null;
    let maxChats = 0;
    const chatCounts = {};
    
    for (const id of possibleIds) {
      const chatCount = await ChatRoom.countDocuments({
        $or: [
          { lawyerId: id },
          { chatRoomId: { $regex: `_${id}_` } }
        ]
      });
      
      chatCounts[id.toString()] = chatCount;
      console.log(`📊 Lawyer ID ${id}: ${chatCount} chat rooms`);
      
      if (chatCount > maxChats) {
        maxChats = chatCount;
        activeLawyerId = id;
      }
    }
    
    // If no chats exist, use the first available lawyer ID
    if (!activeLawyerId && possibleIds.length > 0) {
      activeLawyerId = possibleIds[0];
      console.log('📝 No chats found, using first available ID:', activeLawyerId);
    }
    
    console.log('✅ Active lawyer ID resolved:', activeLawyerId?.toString());
    
    res.json({
      success: true,
      activeLawyerId: activeLawyerId?.toString(),
      chatCount: maxChats,
      allCounts: chatCounts,
      email: email
    });
    
  } catch (error) {
    console.error('❌ Error resolving lawyer ID:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error resolving lawyer ID',
      error: error.message 
    });
  }
});

// Get chat rooms for a specific client
router.get('/rooms/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { userType } = req.query;
    
    console.log('🔍 Fetching chat rooms for user:', userId, 'Type:', userType);

    let chatRooms;

    if (userType === 'client') {
      // For clients: Find rooms where they are the client
      chatRooms = await ChatRoom.find({ clientId: userId })
        .populate('lawyerId', 'personalInfo.fullName personalInfo.email')
        .sort({ updatedAt: -1 });
    } else {
      // For other user types, return empty for now
      chatRooms = [];
    }

    console.log('✅ Found chat rooms:', chatRooms.length);

    const formattedRooms = chatRooms.map(room => ({
      _id: room._id,
      chatRoomId: room.chatRoomId,
      lawyerId: room.lawyerId,
      lawyerName: room.lawyerId?.personalInfo?.fullName || 'Lawyer',
      clientId: room.clientId,
      lastMessage: room.lastMessage,
      lastMessageTime: room.updatedAt,
      updatedAt: room.updatedAt,
      isActive: room.isActive
    }));

    res.json({
      success: true,
      chatRooms: formattedRooms
    });

  } catch (error) {
    console.error('❌ Error fetching chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat rooms'
    });
  }
});

// ✅ ENHANCED: Get chat rooms for ANY lawyer with dynamic resolution
router.get('/lawyer-rooms/:lawyerId', async (req, res) => {
  try {
    const { lawyerId } = req.params;
    console.log('🔍 Fetching chat rooms for lawyer:', lawyerId);

    // Validate lawyer ID format
    if (!mongoose.Types.ObjectId.isValid(lawyerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid lawyer ID format'
      });
    }

    // ✅ ENHANCED: Find all chat rooms where ANY lawyer is involved
    const chatRooms = await ChatRoom.find({
      $or: [
        { lawyerId: lawyerId },
        { chatRoomId: { $regex: `_${lawyerId}_` } }
      ]
    }).populate('clientId', 'name email')
      .populate('lawyerId', 'personalInfo.fullName personalInfo.email')
      .sort({ updatedAt: -1 });

    console.log(`✅ Found ${chatRooms.length} chat rooms for lawyer:`, lawyerId);

    // ✅ ENHANCED: Format response for ANY lawyer
    const formattedRooms = chatRooms.map(room => ({
      _id: room._id,
      chatRoomId: room.chatRoomId,
      clientId: room.clientId?._id || room.clientId,
      clientName: room.clientId?.name || 'Client',
      clientEmail: room.clientId?.email || '',
      lawyerId: room.lawyerId?._id || room.lawyerId,
      lawyerName: room.lawyerId?.personalInfo?.fullName || 'Lawyer',
      lastMessage: room.lastMessage || 'No messages yet',
      lastMessageTime: room.updatedAt,
      updatedAt: room.updatedAt,
      isActive: room.isActive || true
    }));

    res.json({
      success: true,
      chatRooms: formattedRooms,
      count: formattedRooms.length
    });

  } catch (error) {
    console.error('❌ Error fetching lawyer chat rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat rooms',
      error: error.message
    });
  }
});

// Get messages for a specific chat room
router.get('/messages/:chatRoomId', async (req, res) => {
  try {
    const { chatRoomId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    console.log('📜 Fetching messages for room:', chatRoomId);

    // Check if chat room exists
    const chatRoom = await ChatRoom.findOne({ chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Get messages with pagination
    const messages = await Message.find({ chatRoomId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('senderId', 'name email');

    console.log('✅ Found messages:', messages.length);

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ chatRoomId })
      }
    });

  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// Send a message
router.post('/send-message', async (req, res) => {
  try {
    const { chatRoomId, message, senderId, senderType, senderName } = req.body;
    
    console.log('📤 Sending message to room:', chatRoomId);

    if (!chatRoomId || !message || !senderId) {
      return res.status(400).json({
        success: false,
        message: 'Chat room ID, message, and sender ID are required'
      });
    }

    // Check if chat room exists
    const chatRoom = await ChatRoom.findOne({ chatRoomId });
    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: 'Chat room not found'
      });
    }

    // Create new message
    const newMessage = new Message({
      chatRoomId,
      message,
      senderId,
      senderType: senderType || 'client',
      senderName: senderName || 'User',
      timestamp: new Date()
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

    console.log('✅ Message saved to database');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      messageData: {
        _id: newMessage._id,
        chatRoomId: newMessage.chatRoomId,
        message: newMessage.message,
        senderId: newMessage.senderId,
        senderType: newMessage.senderType,
        senderName: newMessage.senderName,
        timestamp: newMessage.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is working',
    timestamp: new Date().toISOString(),
    endpoints: [
      'POST /create-room - Create or get chat room',
      'GET /resolve-lawyer-id/:email - Resolve active lawyer ID',
      'GET /rooms/:userId - Get user chat rooms',
      'GET /lawyer-rooms/:lawyerId - Get lawyer chat rooms',
      'GET /messages/:chatRoomId - Get chat messages',
      'POST /send-message - Send a message'
    ]
  });
});

module.exports = router;
