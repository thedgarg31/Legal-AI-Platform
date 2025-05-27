const socketIo = require('socket.io');
const Chat = require('../models/chat');
const Lawyer = require('../models/Lawyer');

class RealTimeChatService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
      }
    });

    this.activeUsers = new Map(); // Track online users
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      // Log all socket events for debugging
      socket.onAny((eventName, ...args) => {
        console.log(`🔍 Socket event received: ${eventName}`, args);
      });

      console.log('🔌 User connected:', socket.id);

      // User joins with their ID
      socket.on('user_join', (data) => {
        const { userId, userType } = data; // userType: 'lawyer' or 'client'
        this.activeUsers.set(userId, { socketId: socket.id, userType });
        socket.userId = userId;
        socket.userType = userType;
        
        console.log(`👤 ${userType} ${userId} joined`);
        
        // Update lawyer online status if lawyer joins
        if (userType === 'lawyer') {
          this.updateLawyerOnlineStatus(userId, true);
        }
      });

      // Join specific chat room
      socket.on('join_chat', async (data) => {
        const { lawyerId, clientId, chatRoomId } = data;
        socket.join(chatRoomId);
        
        console.log(`💬 User joined chat room: ${chatRoomId}`);
        console.log(`👤 User type: ${socket.userType}`);
        console.log(`🏠 Rooms user is in:`, Array.from(socket.rooms));
        
        // Notify other user in the room
        socket.to(chatRoomId).emit('user_joined_chat', {
          userId: socket.userId,
          userType: socket.userType,
          message: `${socket.userType} has joined the chat`
        });
        
        // Send existing chat history
        try {
          const chat = await this.getChatHistory(chatRoomId);
          if (chat && chat.messages) {
            console.log(`📜 Sending ${chat.messages.length} existing messages to ${socket.userType}`);
            socket.emit('chat_history', { messages: chat.messages });
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
        }
      });

      // Handle message sending
      socket.on('send_message', async (data) => {
        try {
          const { chatRoomId, message, senderId, senderType } = data;
          
          console.log(`📨 Message received in room: ${chatRoomId}`);
          console.log(`From: ${senderType} (${senderId})`);
          console.log(`Message: ${message}`);
          
          const messageData = {
            messageId: Date.now().toString(),
            message,
            senderId,
            senderType,
            timestamp: new Date(),
            read: false
          };

          // Save message to database
          await this.saveChatMessage(chatRoomId, messageData);
          
          // CRITICAL: If this is a client message, automatically add the lawyer to the room
          if (senderType === 'client') {
            const lawyerId = chatRoomId.split('_')[1];
            console.log(`🔍 Looking for lawyer ${lawyerId} to add to room`);
            
            // Find the lawyer's socket
            const lawyerData = this.activeUsers.get(lawyerId);
            if (lawyerData && lawyerData.socketId) {
              const lawyerSocket = this.io.sockets.sockets.get(lawyerData.socketId);
              if (lawyerSocket) {
                // Add lawyer to the room
                lawyerSocket.join(chatRoomId);
                console.log(`✅ Added lawyer ${lawyerId} to room ${chatRoomId}`);
                
                // Notify lawyer about the new chat room
                lawyerSocket.emit('new_chat_room', { 
                  chatRoomId,
                  clientId: senderId,
                  message: 'New client message received'
                });
                
                // Send the message data directly to lawyer
                lawyerSocket.emit('receive_message', messageData);
                console.log(`📤 Sent message directly to lawyer ${lawyerId}`);
              } else {
                console.log(`❌ Lawyer socket not found for ID: ${lawyerData.socketId}`);
              }
            } else {
              console.log(`❌ Lawyer ${lawyerId} not found in active users`);
            }
          }
          
          // Broadcast to ALL users in the chat room
          this.io.to(chatRoomId).emit('receive_message', messageData);
          
          // Also emit to sender to ensure they see their own message
          socket.emit('receive_message', messageData);
          
          console.log(`✅ Message broadcasted to room: ${chatRoomId}`);
          console.log(`📊 Room ${chatRoomId} has ${this.io.sockets.adapter.rooms.get(chatRoomId)?.size || 0} users`);
          
        } catch (error) {
          console.error('❌ Send message error:', error);
          socket.emit('message_error', { error: 'Failed to send message' });
        }
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        const { chatRoomId, userId, isTyping } = data;
        console.log(`⌨️ ${userId} is ${isTyping ? 'typing' : 'stopped typing'} in ${chatRoomId}`);
        socket.to(chatRoomId).emit('user_typing', {
          userId,
          isTyping
        });
      });

      // Handle message read status
      socket.on('mark_messages_read', async (data) => {
        try {
          const { chatRoomId, userId } = data;
          await this.markMessagesAsRead(chatRoomId, userId);
          
          socket.to(chatRoomId).emit('messages_read', {
            readBy: userId,
            timestamp: new Date()
          });
        } catch (error) {
          console.error('❌ Mark messages read error:', error);
        }
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('🔌 User disconnected:', socket.id);
        
        if (socket.userId) {
          this.activeUsers.delete(socket.userId);
          
          // Update lawyer offline status if lawyer disconnects
          if (socket.userType === 'lawyer') {
            this.updateLawyerOnlineStatus(socket.userId, false);
          }
        }
      });
    });
  }

  async getChatHistory(chatRoomId) {
    try {
      const chat = await Chat.findOne({ chatRoomId });
      return chat;
    } catch (error) {
      console.error('❌ Get chat history error:', error);
      return null;
    }
  }

  async saveChatMessage(chatRoomId, messageData) {
    try {
      let chat = await Chat.findOne({ chatRoomId });
      
      if (!chat) {
        // Create new chat if doesn't exist
        const [, lawyerId, clientId] = chatRoomId.split('_');
        chat = new Chat({
          chatRoomId,
          lawyerId,
          clientId,
          messages: []
        });
        console.log(`📝 Created new chat room: ${chatRoomId}`);
      }

      chat.messages.push(messageData);
      await chat.save();
      
      console.log(`💾 Message saved to database for room: ${chatRoomId}`);
      return messageData;
    } catch (error) {
      console.error('❌ Save chat message error:', error);
      throw error;
    }
  }

  async markMessagesAsRead(chatRoomId, userId) {
    try {
      const chat = await Chat.findOne({ chatRoomId });
      if (!chat) return;

      // Mark messages as read for messages not sent by this user
      chat.messages.forEach(msg => {
        if (msg.senderId !== userId) {
          msg.read = true;
        }
      });

      await chat.save();
    } catch (error) {
      console.error('❌ Mark messages read error:', error);
      throw error;
    }
  }

  async updateLawyerOnlineStatus(lawyerId, isOnline) {
    try {
      await Lawyer.findByIdAndUpdate(lawyerId, {
        'availability.isOnline': isOnline
      });
      
      // Broadcast lawyer status to all clients
      this.io.emit('lawyer_status_changed', {
        lawyerId,
        isOnline
      });
      
      console.log(`👨‍💼 Lawyer ${lawyerId} is now ${isOnline ? 'online' : 'offline'}`);
    } catch (error) {
      console.error('❌ Update lawyer status error:', error);
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    return this.activeUsers.size;
  }

  // Check if specific user is online
  isUserOnline(userId) {
    return this.activeUsers.has(userId);
  }

  // Get all active chat rooms
  getActiveChatRooms() {
    return Array.from(this.io.sockets.adapter.rooms.keys())
      .filter(room => room.startsWith('chat_'));
  }

  // Get users in a specific room
  getUsersInRoom(chatRoomId) {
    const room = this.io.sockets.adapter.rooms.get(chatRoomId);
    return room ? room.size : 0;
  }
}

module.exports = RealTimeChatService;
