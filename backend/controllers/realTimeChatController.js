const Chat = require('../models/chat');
const Lawyer = require('../models/Lawyer');

// Create or get existing chat room
const createChatRoom = async (req, res) => {
  try {
    console.log('=== CREATE CHAT ROOM ===');
    
    const { lawyerId, clientId } = req.body;
    const chatRoomId = `chat_${lawyerId}_${clientId}`;

    // Check if chat already exists
    let existingChat = await Chat.findOne({ chatRoomId });
    
    if (existingChat) {
      console.log('✅ Existing chat room found');
      return res.json({ success: true, chatRoom: existingChat });
    }

    // Verify lawyer exists and is verified
    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer || lawyer.verification.status !== 'verified') {
      return res.status(400).json({ success: false, message: 'Lawyer not found or not verified' });
    }

    // Create new chat room
    const newChat = new Chat({
      chatRoomId,
      lawyerId,
      clientId,
      messages: [],
      status: 'active'
    });

    await newChat.save();
    console.log('✅ New chat room created');

    res.json({ success: true, chatRoom: newChat });
  } catch (error) {
    console.error('❌ Create chat room error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get chat history
const getChatHistory = async (req, res) => {
  try {
    console.log('=== GET CHAT HISTORY ===');
    
    const { chatRoomId } = req.params;
    
    const chat = await Chat.findOne({ chatRoomId })
      .populate('lawyerId', 'personalInfo.fullName personalInfo.profilePhoto')
      .sort({ 'messages.timestamp': 1 });

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    console.log(`✅ Found chat with ${chat.messages.length} messages`);
    res.json({ success: true, chat });
  } catch (error) {
    console.error('❌ Get chat history error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// End chat session
const endChatSession = async (req, res) => {
  try {
    console.log('=== END CHAT SESSION ===');
    
    const { chatRoomId } = req.params;
    
    const chat = await Chat.findOne({ chatRoomId });
    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat not found' });
    }

    chat.status = 'ended';
    chat.endTime = new Date();
    await chat.save();

    console.log('✅ Chat session ended');
    res.json({ success: true, message: 'Chat session ended successfully' });
  } catch (error) {
    console.error('❌ End chat session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createChatRoom,
  getChatHistory,
  endChatSession
};
