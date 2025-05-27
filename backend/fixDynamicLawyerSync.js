const mongoose = require('mongoose');
const User = require('./models/User');
const Lawyer = require('./models/Lawyer');
const ChatRoom = require('./models/ChatRoom');
require('dotenv').config();

const fixDynamicLawyerSync = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all lawyers and their associated data
    const allLawyers = await User.find({ userType: 'lawyer' });
    
    for (const user of allLawyers) {
      console.log(`\nProcessing lawyer: ${user.name} (${user.email})`);
      
      // Find all possible lawyer records for this email
      const lawyerRecords = await Lawyer.find({ 'personalInfo.email': user.email });
      console.log(`Found ${lawyerRecords.length} lawyer records`);
      
      // Find chat rooms for all possible lawyer IDs
      let chatRooms = [];
      const possibleLawyerIds = [
        user.lawyerId,
        ...lawyerRecords.map(l => l._id)
      ].filter(Boolean);
      
      for (const lawyerId of possibleLawyerIds) {
        const rooms = await ChatRoom.find({
          $or: [
            { lawyerId: lawyerId },
            { chatRoomId: { $regex: `_${lawyerId}_` } }
          ]
        });
        chatRooms.push(...rooms);
        console.log(`Lawyer ID ${lawyerId}: ${rooms.length} chat rooms`);
      }
      
      // Use the lawyer ID that has the most chat data
      let primaryLawyerId = null;
      let maxChats = 0;
      
      for (const lawyerId of possibleLawyerIds) {
        const roomCount = chatRooms.filter(room => 
          room.lawyerId.toString() === lawyerId.toString() ||
          room.chatRoomId.includes(`_${lawyerId}_`)
        ).length;
        
        if (roomCount > maxChats) {
          maxChats = roomCount;
          primaryLawyerId = lawyerId;
        }
      }
      
      // If no chats exist, use the first available lawyer record
      if (!primaryLawyerId && lawyerRecords.length > 0) {
        primaryLawyerId = lawyerRecords[0]._id;
      }
      
      if (primaryLawyerId) {
        console.log(`Primary lawyer ID: ${primaryLawyerId} (${maxChats} chats)`);
        
        // Update User record to use primary lawyer ID
        await User.findByIdAndUpdate(user._id, {
          lawyerId: primaryLawyerId
        });
        
        // Consolidate all chat rooms to use primary lawyer ID
        for (const room of chatRooms) {
          if (room.lawyerId.toString() !== primaryLawyerId.toString()) {
            console.log(`Moving chat room ${room.chatRoomId} to primary lawyer ID`);
            await ChatRoom.findByIdAndUpdate(room._id, {
              lawyerId: primaryLawyerId
            });
          }
        }
        
        console.log(`Synced ${user.name} with lawyer ID: ${primaryLawyerId}`);
      } else {
        console.log(`No lawyer record found for ${user.name}`);
      }
    }
    
    console.log('\nDynamic lawyer sync completed!');
    console.log('All lawyers now have consistent IDs across User records and chat rooms.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error in dynamic lawyer sync:', error);
    process.exit(1);
  }
};

fixDynamicLawyerSync();
