const mongoose = require('mongoose');
const ChatRoom = require('./models/ChatRoom');
require('dotenv').config();

const createMissingChatRoom = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create the chat room that exists in memory but not in database
    const chatRoom = await ChatRoom.findOneAndUpdate(
      { chatRoomId: 'chat_68343b007976480a55bce7f5_68359d8a87ae0b28dab9130f' },
      {
        chatRoomId: 'chat_68343b007976480a55bce7f5_68359d8a87ae0b28dab9130f',
        lawyerId: '68343b007976480a55bce7f5', // Dr. Rajesh Kumar
        clientId: '68359d8a87ae0b28dab9130f',  // Aryan
        participants: ['68343b007976480a55bce7f5', '68359d8a87ae0b28dab9130f'],
        lastMessage: 'hello',
        lastMessageTime: new Date(),
        isActive: true
      },
      { upsert: true, new: true }
    );

    console.log('✅ Chat room created in database:', chatRoom.chatRoomId);
    console.log('✅ Lawyer ID:', chatRoom.lawyerId);
    console.log('✅ Client ID:', chatRoom.clientId);
    console.log('✅ Last Message:', chatRoom.lastMessage);
    
    console.log('\n🎉 Chat room successfully saved to database!');
    console.log('Now Dr. Rajesh Kumar should see the conversation in Chat History.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating chat room:', error);
    process.exit(1);
  }
};

createMissingChatRoom();
