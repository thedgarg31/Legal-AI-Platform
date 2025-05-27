import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import io from 'socket.io-client';
import { getLawyerById } from '../api/lawyers';
import { createChatRoom } from '../api/realTimeChat';

const ChatRoom = () => {
  const { lawyerId } = useParams();
  const [socket, setSocket] = useState(null);
  const [lawyer, setLawyer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatRoomId, setChatRoomId] = useState('');
  const messagesEndRef = useRef(null);
  const clientId = 'client_' + Date.now(); // In real app, get from auth

  useEffect(() => {
    initializeChat();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [lawyerId]);

  const initializeChat = async () => {
    try {
      console.log('🔄 Initializing chat with lawyer:', lawyerId);
      
      // Get lawyer details
      const lawyerResult = await getLawyerById(lawyerId);
      if (lawyerResult.success) {
        setLawyer(lawyerResult.lawyer);
        console.log('✅ Lawyer details loaded:', lawyerResult.lawyer.personalInfo.fullName);
      }

      // Create or get chat room
      const chatResult = await createChatRoom({ lawyerId, clientId });
      if (chatResult.success) {
        const roomId = chatResult.chatRoom.chatRoomId;
        setChatRoomId(roomId);
        console.log('✅ Chat room created/found:', roomId);

        // Initialize socket connection
        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        // Join as client
        newSocket.emit('user_join', { userId: clientId, userType: 'client' });
        console.log('👤 Joined as client:', clientId);

        // Join chat room
        newSocket.emit('join_chat', { lawyerId, clientId, chatRoomId: roomId });
        console.log('💬 Joined chat room:', roomId);

        // Listen for messages
        newSocket.on('receive_message', (messageData) => {
          console.log('📥 Received message:', messageData);
          setMessages(prev => {
            // Avoid duplicate messages
            const exists = prev.some(msg => msg.messageId === messageData.messageId);
            if (exists) return prev;
            return [...prev, messageData];
          });
        });

        // Listen for chat history
        newSocket.on('chat_history', (data) => {
          console.log('📜 Loading chat history:', data.messages);
          setMessages(data.messages || []);
        });

        // Listen for typing
        newSocket.on('user_typing', (data) => {
          console.log('⌨️ Typing indicator:', data);
          setIsTyping(data.isTyping);
        });

        // Listen for user joined
        newSocket.on('user_joined_chat', (data) => {
          console.log('👋 User joined chat:', data);
        });
      }
    } catch (error) {
      console.error('❌ Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (currentMessage.trim() && socket && chatRoomId) {
        const messageData = {
        chatRoomId,
        message: currentMessage,
        senderId: clientId,
        senderType: 'client'
        };
        
        console.log('📤 CLIENT: Sending message with event "send_message":', messageData);
        socket.emit('send_message', messageData);
        setCurrentMessage('');
        }
    };



  const handleTyping = (typing) => {
    if (socket && chatRoomId) {
      socket.emit('typing', {
        chatRoomId,
        userId: clientId,
        isTyping: typing
      });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#6c757d' }}>Connecting to lawyer...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Chat Header */}
      <div className="card" style={{ marginBottom: '1rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/lawyers" style={{ color: '#666FD0', textDecoration: 'none' }}>
            ← Back
          </Link>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: lawyer?.personalInfo.profilePhoto 
              ? `url(http://localhost:5000/uploads/lawyer-documents/${lawyer.personalInfo.profilePhoto})` 
              : 'linear-gradient(135deg, #666FD0 0%, #4c63d2 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: 'bold'
          }}>
            {!lawyer?.personalInfo.profilePhoto && lawyer?.personalInfo.fullName.charAt(0)}
          </div>
          <div>
            <h3 style={{ color: '#0E0F22', margin: 0 }}>
              {lawyer?.personalInfo.fullName}
            </h3>
            <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
              {lawyer?.availability.isOnline ? '🟢 Online' : '⚫ Offline'} • 
              {lawyer?.credentials.specializations[0]}
            </p>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#6c757d' }}>
            Chat ID: {chatRoomId}
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="card" style={{ 
        flex: 1, 
        padding: '1rem', 
        marginBottom: '1rem',
        maxHeight: '500px',
        overflowY: 'auto'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💬</div>
            <p>Start a conversation with {lawyer?.personalInfo.fullName}</p>
            <p style={{ fontSize: '0.9rem' }}>Send a message below to begin your consultation</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={message.messageId || index} style={{
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: message.senderType === 'client' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '1rem',
                borderRadius: '12px',
                background: message.senderType === 'client' 
                  ? '#666FD0' 
                  : '#f8f9fa',
                color: message.senderType === 'client' ? 'white' : '#0E0F22',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ 
                  fontSize: '0.8rem', 
                  opacity: 0.8,
                  marginBottom: '0.5rem'
                }}>
                  {message.senderType === 'client' ? 'You' : lawyer?.personalInfo.fullName}
                </div>
                <div>{message.message}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  opacity: 0.7,
                  marginTop: '0.5rem'
                }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        
        {isTyping && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: '#f8f9fa',
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              {lawyer?.personalInfo.fullName} is typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onFocus={() => handleTyping(true)}
            onBlur={() => handleTyping(false)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '1rem',
              border: '2px solid #e9ecef',
              borderRadius: '25px',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!currentMessage.trim()}
            style={{
              background: currentMessage.trim() ? '#666FD0' : '#e9ecef',
              color: currentMessage.trim() ? 'white' : '#6c757d',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: currentMessage.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
