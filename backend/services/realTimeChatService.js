const socketIo = require('socket.io');
const cors = require('cors');
const Lawyer = require('../models/Lawyer');

class RealTimeChatService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.connectedUsers = new Map();
    this.chatRooms = new Map();
    this.recentMessages = new Set(); // For duplicate prevention
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('🔌 User connected:', socket.id);

      // Handle user joining
      socket.on('user_join', (data) => {
        console.log('🔍 Socket event received: user_join', [data]);
        
        if (data && data.userId && data.userType) {
          this.handleUserJoin(socket, data);
        } else {
          console.log('❌ Invalid user_join data:', data);
        }
      });

      // Handle joining chat rooms
      socket.on('join_chat', (data) => {
        console.log('💬 Join chat request:', data);
        this.handleJoinChat(socket, data);
      });

      // Handle sending messages
      socket.on('send_message', (messageData) => {
        console.log('📤 Message received from client:', messageData);
        this.handleSendMessage(socket, messageData);
      });

      // Handle typing indicators
      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log('🔌 User disconnected:', socket.id, 'Reason:', reason);
        this.handleUserDisconnect(socket);
      });
    });
  }

  async handleUserJoin(socket, data) {
    try {
      const { userId, userType } = data;
      
      // Store user info
      socket.userId = userId;
      socket.userType = userType;
      
      // Add to connected users
      this.connectedUsers.set(socket.id, {
        userId,
        userType,
        socketId: socket.id,
        joinedAt: new Date()
      });

      console.log(`👤 ${userType} ${userId} joined`);

      // Update lawyer online status if it's a lawyer
      if (userType === 'lawyer') {
        await this.updateLawyerOnlineStatus(userId, true);
      }

      // Join user to their own room for private messages
      socket.join(`user_${userId}`);

    } catch (error) {
      console.error('❌ Error in handleUserJoin:', error);
    }
  }

  handleJoinChat(socket, data) {
    try {
      const { lawyerId, clientId, chatRoomId } = data;
      
      if (!chatRoomId) {
        console.log('❌ No chatRoomId provided');
        return;
      }

      // Join the chat room
      socket.join(chatRoomId);
      console.log(`💬 User ${socket.userId} joined chat room: ${chatRoomId}`);

      // Store chat room info
      if (!this.chatRooms.has(chatRoomId)) {
        this.chatRooms.set(chatRoomId, {
          lawyerId,
          clientId,
          participants: new Set(),
          createdAt: new Date(),
          messages: []
        });
      }

      // Add participant to chat room
      const chatRoom = this.chatRooms.get(chatRoomId);
      chatRoom.participants.add(socket.userId);

      // Notify other participants
      socket.to(chatRoomId).emit('user_joined_chat', {
        userId: socket.userId,
        userType: socket.userType,
        chatRoomId
      });

      // Send chat history to the joining user
      socket.emit('chat_history', {
        chatRoomId,
        messages: chatRoom.messages || []
      });

      // Notify lawyer about new chat room if they're not already aware
      if (socket.userType === 'client') {
        this.io.to(`user_${lawyerId}`).emit('new_chat_room', {
          chatRoomId,
          clientId,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('❌ Error in handleJoinChat:', error);
    }
  }

  handleSendMessage(socket, messageData) {
    try {
      const { chatRoomId, message, messageId } = messageData;

      if (!chatRoomId || !message || !messageId) {
        console.log('❌ Invalid message data:', messageData);
        return;
      }

      // ✅ DUPLICATE PREVENTION
      if (this.recentMessages.has(messageId)) {
        console.log('⚠️ Duplicate message prevented on server:', messageId);
        return;
      }

      // Add to recent messages (keep only last 100)
      this.recentMessages.add(messageId);
      if (this.recentMessages.size > 100) {
        const firstItem = this.recentMessages.values().next().value;
        this.recentMessages.delete(firstItem);
      }

      // Add sender info
      const enrichedMessage = {
        ...messageData,
        socketId: socket.id,
        timestamp: new Date()
      };

      // Store message in chat room
      if (this.chatRooms.has(chatRoomId)) {
        const chatRoom = this.chatRooms.get(chatRoomId);
        chatRoom.messages.push(enrichedMessage);
        
        // Keep only last 50 messages in memory
        if (chatRoom.messages.length > 50) {
          chatRoom.messages = chatRoom.messages.slice(-50);
        }
      }

      console.log('📨 Broadcasting message to room:', chatRoomId);

      // Broadcast message to all users in the chat room
      this.io.to(chatRoomId).emit('receive_message', enrichedMessage);

      // Also send to lawyer's personal room if client is sending
      if (socket.userType === 'client' && this.chatRooms.has(chatRoomId)) {
        const chatRoom = this.chatRooms.get(chatRoomId);
        this.io.to(`user_${chatRoom.lawyerId}`).emit('receive_message', enrichedMessage);
      }

    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
    }
  }

  handleTyping(socket, data) {
    try {
      const { chatRoomId, userId, isTyping } = data;
      
      if (!chatRoomId) return;

      // Broadcast typing status to other users in the chat room
      socket.to(chatRoomId).emit('user_typing', {
        userId,
        isTyping,
        userType: socket.userType
      });

    } catch (error) {
      console.error('❌ Error in handleTyping:', error);
    }
  }

  async handleUserDisconnect(socket) {
    try {
      const userInfo = this.connectedUsers.get(socket.id);
      
      if (userInfo) {
        const { userId, userType } = userInfo;
        
        // Update lawyer offline status if it's a lawyer
        if (userType === 'lawyer') {
          await this.updateLawyerOnlineStatus(userId, false);
        }

        // Remove from connected users
        this.connectedUsers.delete(socket.id);
        
        console.log(`👤 ${userType} ${userId} disconnected`);
      }

    } catch (error) {
      console.error('❌ Error in handleUserDisconnect:', error);
    }
  }

  async updateLawyerOnlineStatus(lawyerId, isOnline) {
    try {
      await Lawyer.findByIdAndUpdate(
        lawyerId,
        { 'availability.isOnline': isOnline },
        { new: true }
      );
      
      console.log(`👨‍💼 Lawyer ${lawyerId} is now ${isOnline ? 'online' : 'offline'}`);
      
    } catch (error) {
      console.error('❌ Error updating lawyer status:', error);
    }
  }

  // Utility methods
  getOnlineUsersCount() {
    return this.connectedUsers.size;
  }

  getConnectedUsers() {
    return Array.from(this.connectedUsers.values());
  }

  getChatRooms() {
    return Array.from(this.chatRooms.keys());
  }

  getUsersInRoom(roomId) {
    const room = this.io.sockets.adapter.rooms.get(roomId);
    return room ? Array.from(room) : [];
  }

  // Clean up old messages periodically
  startMessageCleanup() {
    setInterval(() => {
      // Clear old recent messages (older than 5 minutes)
      if (this.recentMessages.size > 50) {
        this.recentMessages.clear();
        console.log('🧹 Cleaned up recent messages cache');
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }
}

module.exports = RealTimeChatService;
