const socketIo = require('socket.io');
const cors = require('cors');
const Lawyer = require('../models/Lawyer');
const User = require('../models/User');
const ChatRoom = require('../models/ChatRoom');

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
    this.recentMessages = new Set();
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('user_join', (data) => {
        console.log('Socket event received: user_join', [data]);
        
        if (data && data.userId && data.userType) {
          this.handleUserJoin(socket, data);
        } else {
          console.log('Invalid user_join data:', data);
        }
      });

      socket.on('join_chat', (data) => {
        console.log('Join chat request:', data);
        this.handleJoinChat(socket, data);
      });

      socket.on('send_message', (messageData) => {
        console.log('Message received from client:', messageData);
        this.handleSendMessage(socket, messageData);
      });

      socket.on('typing', (data) => {
        this.handleTyping(socket, data);
      });

      socket.on('disconnect', (reason) => {
        console.log('User disconnected:', socket.id, 'Reason:', reason);
        this.handleUserDisconnect(socket);
      });
    });
  }

  async handleUserJoin(socket, data) {
    try {
      const { userId, userType, userName } = data;
      
      socket.userId = userId;
      socket.userType = userType;
      socket.userName = userName || 'Unknown User';
      
      this.connectedUsers.set(socket.id, {
        userId,
        userType,
        userName: userName || 'Unknown User',
        socketId: socket.id,
        joinedAt: new Date()
      });

      console.log(`${userType} ${userName || userId} joined`);

      if (userType === 'lawyer') {
        await this.updateLawyerOnlineStatus(userId, true);
      }

      socket.join(`user_${userId}`);

    } catch (error) {
      console.error('Error in handleUserJoin:', error);
    }
  }

  async handleJoinChat(socket, data) {
    try {
      const { lawyerId, clientId, chatRoomId } = data;
      
      if (!chatRoomId) {
        console.log('No chatRoomId provided');
        return;
      }

      socket.join(chatRoomId);
      console.log(`User ${socket.userId} (${socket.userName}) joined chat room: ${chatRoomId}`);

      if (!this.chatRooms.has(chatRoomId)) {
        this.chatRooms.set(chatRoomId, {
          lawyerId,
          clientId,
          participants: new Set(),
          createdAt: new Date(),
          messages: []
        });

        // Save to database
        try {
          await ChatRoom.findOneAndUpdate(
            { chatRoomId },
            {
              chatRoomId,
              lawyerId,
              clientId,
              participants: [lawyerId, clientId],
              lastMessage: '',
              isActive: true
            },
            { upsert: true, new: true }
          );
          console.log('Chat room saved to database:', chatRoomId);
        } catch (error) {
          console.error('Error saving chat room to database:', error);
        }
      }

      const chatRoom = this.chatRooms.get(chatRoomId);
      chatRoom.participants.add(socket.userId);

      socket.to(chatRoomId).emit('user_joined_chat', {
        userId: socket.userId,
        userType: socket.userType,
        userName: socket.userName,
        chatRoomId
      });

      socket.emit('chat_history', {
        chatRoomId,
        messages: chatRoom.messages || []
      });

      if (socket.userType === 'client') {
        this.io.to(`user_${lawyerId}`).emit('new_chat_room', {
          chatRoomId,
          clientId,
          clientName: socket.userName,
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error in handleJoinChat:', error);
    }
  }

  async handleSendMessage(socket, messageData) {
    try {
      const { chatRoomId, message, messageId, senderName } = messageData;

      if (!chatRoomId || !message || !messageId) {
        console.log('Invalid message data:', messageData);
        return;
      }

      if (this.recentMessages.has(messageId)) {
        console.log('Duplicate message prevented on server:', messageId);
        return;
      }

      this.recentMessages.add(messageId);
      if (this.recentMessages.size > 100) {
        const firstItem = this.recentMessages.values().next().value;
        this.recentMessages.delete(firstItem);
      }

      const enrichedMessage = {
        ...messageData,
        socketId: socket.id,
        senderName: senderName || socket.userName || 'Unknown User',
        timestamp: new Date()
      };

      if (this.chatRooms.has(chatRoomId)) {
        const chatRoom = this.chatRooms.get(chatRoomId);
        chatRoom.messages.push(enrichedMessage);
        
        if (chatRoom.messages.length > 50) {
          chatRoom.messages = chatRoom.messages.slice(-50);
        }
      }

      console.log(`Broadcasting message from ${enrichedMessage.senderName} to room:`, chatRoomId);

      this.io.to(chatRoomId).emit('receive_message', enrichedMessage);

      if (socket.userType === 'client' && this.chatRooms.has(chatRoomId)) {
        const chatRoom = this.chatRooms.get(chatRoomId);
        this.io.to(`user_${chatRoom.lawyerId}`).emit('receive_message', enrichedMessage);
      }

      // Update database with last message
      try {
        await ChatRoom.findOneAndUpdate(
          { chatRoomId },
          {
            lastMessage: enrichedMessage.message,
            lastMessageTime: new Date()
          }
        );
        console.log('Last message updated in database');
      } catch (error) {
        console.error('Error updating last message:', error);
      }

    } catch (error) {
      console.error('Error in handleSendMessage:', error);
    }
  }

  handleTyping(socket, data) {
    try {
      const { chatRoomId, userId, isTyping } = data;
      
      if (!chatRoomId) return;

      socket.to(chatRoomId).emit('user_typing', {
        userId,
        userName: socket.userName,
        isTyping,
        userType: socket.userType
      });

    } catch (error) {
      console.error('Error in handleTyping:', error);
    }
  }

  async handleUserDisconnect(socket) {
    try {
      const userInfo = this.connectedUsers.get(socket.id);
      
      if (userInfo) {
        const { userId, userType, userName } = userInfo;
        
        if (userType === 'lawyer') {
          await this.updateLawyerOnlineStatus(userId, false);
        }

        this.connectedUsers.delete(socket.id);
        
        console.log(`${userType} ${userName || userId} disconnected`);
      }

    } catch (error) {
      console.error('Error in handleUserDisconnect:', error);
    }
  }

  async updateLawyerOnlineStatus(lawyerId, isOnline) {
    try {
      await Lawyer.findByIdAndUpdate(
        lawyerId,
        { 'availability.isOnline': isOnline },
        { new: true }
      );
      
      console.log(`Lawyer ${lawyerId} is now ${isOnline ? 'online' : 'offline'}`);
      
    } catch (error) {
      console.error('Error updating lawyer status:', error);
    }
  }

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

  startMessageCleanup() {
    setInterval(() => {
      if (this.recentMessages.size > 50) {
        this.recentMessages.clear();
        console.log('Cleaned up recent messages cache');
      }
    }, 5 * 60 * 1000);
  }
}

module.exports = RealTimeChatService;
