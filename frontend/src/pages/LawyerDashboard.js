import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { getLawyerById } from '../api/lawyers';

const LawyerDashboard = () => {
  const { lawyerId } = useParams();
  const [socket, setSocket] = useState(null);
  const [lawyer, setLawyer] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeLawyerDashboard();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [lawyerId]);

  const initializeLawyerDashboard = async () => {
    try {
      console.log('🔄 Initializing lawyer dashboard for:', lawyerId);
      
      const lawyerResult = await getLawyerById(lawyerId);
      if (lawyerResult.success) {
        setLawyer(lawyerResult.lawyer);
        console.log('✅ Lawyer loaded:', lawyerResult.lawyer.personalInfo.fullName);
      }

      // Create socket connection with proper configuration
      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      setSocket(newSocket);

      // Connection event listeners
      newSocket.on('connect', () => {
        console.log('✅ Lawyer socket connected:', newSocket.id);
        setIsConnected(true);
        newSocket.emit('user_join', { userId: lawyerId, userType: 'lawyer' });
        console.log('👨‍💼 Joined as lawyer:', lawyerId);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
      });

      // CRITICAL: Listen for messages with proper state updates
      newSocket.on('receive_message', (messageData) => {
        console.log('📥 LAWYER: Received message globally:', messageData);
        
        const chatRoomId = messageData.chatRoomId;
        
        if (chatRoomId && chatRoomId.includes(lawyerId)) {
          console.log('✅ Message is for this lawyer, processing...');
          
          // Update active chats with functional state update
          setActiveChats(prevChats => {
            console.log('🔄 Current activeChats:', prevChats);
            if (!prevChats.includes(chatRoomId)) {
              console.log('✅ Adding new chat room to UI:', chatRoomId);
              const newChats = [...prevChats, chatRoomId];
              console.log('🔄 New activeChats:', newChats);
              return newChats;
            }
            return prevChats;
          });

          // Auto-select chat room if none selected
          setSelectedChatRoom(prevRoom => {
            if (!prevRoom) {
              console.log('🎯 Auto-selecting chat room for UI:', chatRoomId);
              return chatRoomId;
            }
            return prevRoom;
          });

          // Add message to messages array
          setMessages(prevMessages => {
            const exists = prevMessages.some(msg => msg.messageId === messageData.messageId);
            if (exists) {
              console.log('⚠️ Message already exists, skipping');
              return prevMessages;
            }
            console.log('📝 Adding message to UI state:', messageData.message);
            const newMessages = [...prevMessages, messageData];
            console.log('🔄 New messages array length:', newMessages.length);
            return newMessages;
          });
        }
      });

      // Listen for new chat room notifications
      newSocket.on('new_chat_room', (data) => {
        console.log('🔔 New chat room notification:', data);
        const { chatRoomId } = data;
        
        setActiveChats(prevChats => {
          if (!prevChats.includes(chatRoomId)) {
            console.log('🆕 Adding chat room from notification:', chatRoomId);
            return [...prevChats, chatRoomId];
          }
          return prevChats;
        });
        
        setSelectedChatRoom(prevRoom => {
          if (!prevRoom) {
            return chatRoomId;
          }
          return prevRoom;
        });
      });

      // Listen for chat history
      newSocket.on('chat_history', (data) => {
        console.log('📜 Lawyer loading chat history:', data.messages);
        setMessages(data.messages || []);
      });

      // Listen for typing indicators
      newSocket.on('user_typing', (data) => {
        console.log('⌨️ Client typing:', data);
        setIsTyping(data.isTyping);
      });

      // Listen for user joined events
      newSocket.on('user_joined_chat', (data) => {
        console.log('👋 User joined chat:', data);
      });

    } catch (error) {
      console.error('❌ Error initializing lawyer dashboard:', error);
    }
  };

  const joinChatRoom = (chatRoomId) => {
    console.log('🔄 Lawyer manually joining chat room:', chatRoomId);
    if (socket && isConnected) {
      setSelectedChatRoom(chatRoomId);
      setMessages([]); // Clear messages for new chat room
      
      const clientId = chatRoomId.split('_')[2];
      socket.emit('join_chat', { lawyerId, clientId, chatRoomId });
      console.log('💬 Lawyer joined chat room:', chatRoomId);
    }
  };

  const sendMessage = () => {
    if (currentMessage.trim() && socket && selectedChatRoom && isConnected) {
      const messageData = {
        chatRoomId: selectedChatRoom,
        message: currentMessage,
        senderId: lawyerId,
        senderType: 'lawyer'
      };
      
      console.log('📤 Lawyer sending message:', messageData);
      socket.emit('send_message', messageData);
      setCurrentMessage('');
    }
  };

  const handleTyping = (typing) => {
    if (socket && selectedChatRoom && isConnected) {
      socket.emit('typing', { 
        chatRoomId: selectedChatRoom, 
        userId: lawyerId, 
        isTyping: typing 
      });
    }
  };

  const getClientIdFromRoom = (chatRoomId) => {
    const parts = chatRoomId.split('_');
    return parts.slice(2).join('_');
  };

  const formatChatRoomName = (chatRoomId) => {
    const clientId = getClientIdFromRoom(chatRoomId);
    return `Client: ${clientId}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔍 DEBUG: activeChats state changed:', activeChats);
  }, [activeChats]);

  useEffect(() => {
    console.log('🔍 DEBUG: messages state changed:', messages.length, 'messages');
  }, [messages]);

  useEffect(() => {
    console.log('🔍 DEBUG: selectedChatRoom state changed:', selectedChatRoom);
  }, [selectedChatRoom]);

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1400px', 
      margin: '0 auto', 
      background: '#ffffff', 
      minHeight: '100vh' 
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ color: '#666FD0', margin: 0 }}>
          👨‍💼 Lawyer Dashboard
        </h1>
        <h2 style={{ color: '#0E0F22', margin: '0.5rem 0', fontSize: '1.5rem' }}>
          {lawyer?.personalInfo.fullName || 'Loading...'}
        </h2>
        <p style={{ color: '#6c757d', margin: 0 }}>
          {lawyer?.credentials.specializations?.join(', ')} • {lawyer?.credentials.experience} years experience
        </p>
        <div style={{ 
          marginTop: '1rem', 
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: isConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)', 
            borderRadius: '20px',
            display: 'inline-block',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: isConnected ? '#4caf50' : '#f44336'
          }}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: activeChats.length > 0 ? 'rgba(76, 175, 80, 0.1)' : 'rgba(108, 117, 125, 0.1)', 
            borderRadius: '20px',
            display: 'inline-block',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            color: activeChats.length > 0 ? '#4caf50' : '#6c757d'
          }}>
            {activeChats.length > 0 ? `💬 ${activeChats.length} Active Chat${activeChats.length > 1 ? 's' : ''}` : '⚫ No Active Chats'}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem', height: '600px' }}>
        {/* Chat List Sidebar */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ 
            color: '#0E0F22', 
            marginBottom: '1.5rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            💬 Client Messages
            {activeChats.length > 0 && (
              <span style={{ 
                background: '#4caf50', 
                color: 'white', 
                borderRadius: '50%', 
                width: '24px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontSize: '0.8rem' 
              }}>
                {activeChats.length}
              </span>
            )}
          </h3>
          
          {/* Active Chat Rooms from Real Clients */}
          {activeChats.length > 0 ? (
            <div>
              <h4 style={{ 
                color: '#4caf50', 
                fontSize: '0.9rem', 
                marginBottom: '1rem', 
                fontWeight: 'bold' 
              }}>
                🟢 Active Conversations
              </h4>
              {activeChats.map(chatRoomId => (
                <div
                  key={chatRoomId}
                  onClick={() => joinChatRoom(chatRoomId)}
                  style={{
                    padding: '1rem',
                    marginBottom: '0.75rem',
                    background: selectedChatRoom === chatRoomId ? '#666FD0' : '#f8f9fa',
                    color: selectedChatRoom === chatRoomId ? 'white' : '#0E0F22',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedChatRoom === chatRoomId ? '2px solid #666FD0' : '2px solid #e9ecef',
                    transition: 'all 0.3s ease',
                    boxShadow: selectedChatRoom === chatRoomId 
                      ? '0 4px 12px rgba(102, 111, 208, 0.3)' 
                      : '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
                    💬 {formatChatRoomName(chatRoomId)}
                  </div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                    Click to respond
                  </div>
                  {selectedChatRoom === chatRoomId && (
                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.9 }}>
                      ✅ Currently Active
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
              <h4 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                Waiting for Client Messages
              </h4>
              <p style={{ fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
                When clients send you messages from the "Find Lawyers" section, 
                their conversations will appear here automatically.
              </p>
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(102, 111, 208, 0.1)', 
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                💡 <strong>Tip:</strong> Clients can find you at:<br/>
                <code style={{ color: '#666FD0' }}>localhost:3000/lawyers</code>
              </div>
            </div>
          )}
        </div>

        {/* Chat Interface */}
        <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div style={{ 
                borderBottom: '2px solid #e9ecef', 
                paddingBottom: '1rem', 
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <h4 style={{ color: '#0E0F22', margin: 0, marginBottom: '0.25rem' }}>
                      💬 {formatChatRoomName(selectedChatRoom)}
                    </h4>
                    <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>
                      You are responding as {lawyer?.personalInfo.fullName}
                    </p>
                  </div>
                  <div style={{ 
                    background: '#4caf50', 
                    color: 'white', 
                    padding: '0.5rem 1rem', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    🟢 LIVE CHAT
                  </div>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6c757d', marginTop: '0.5rem' }}>
                  Room: {selectedChatRoom} | Messages: {messages.length}
                </div>
              </div>

              {/* Messages */}
              <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                marginBottom: '1rem',
                maxHeight: '400px',
                padding: '0.5rem'
              }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem', color: '#6c757d' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                    <h4 style={{ color: '#0E0F22', marginBottom: '0.5rem' }}>
                      Chat Started
                    </h4>
                    <p style={{ fontSize: '0.9rem', margin: 0 }}>
                      Loading conversation history...
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div key={message.messageId || index} style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: message.senderType === 'lawyer' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        maxWidth: '70%',
                        padding: '1rem',
                        borderRadius: '12px',
                        background: message.senderType === 'lawyer' 
                          ? 'linear-gradient(135deg, #666FD0 0%, #4c63d2 100%)' 
                          : '#f8f9fa',
                        color: message.senderType === 'lawyer' ? 'white' : '#0E0F22',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                        border: message.senderType === 'client' ? '1px solid #e9ecef' : 'none'
                      }}>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          opacity: 0.8,
                          marginBottom: '0.5rem',
                          fontWeight: 'bold'
                        }}>
                          {message.senderType === 'lawyer' ? '👨‍💼 You (Lawyer)' : '👤 Client'}
                        </div>
                        <div style={{ fontSize: '1rem', lineHeight: '1.4' }}>
                          {message.message}
                        </div>
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
                      fontStyle: 'italic',
                      border: '1px solid #e9ecef'
                    }}>
                      <span style={{ marginRight: '0.5rem' }}>⌨️</span>
                      Client is typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div style={{ 
                borderTop: '2px solid #e9ecef', 
                paddingTop: '1rem',
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center' 
              }}>
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your professional response..."
                  disabled={!isConnected}
                  style={{
                    flex: 1,
                    padding: '1rem',
                    border: '2px solid #e9ecef',
                    borderRadius: '25px',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.3s ease',
                    opacity: isConnected ? 1 : 0.6
                  }}
                  onFocus={(e) => {
                    if (isConnected) {
                      e.target.style.borderColor = '#666FD0';
                      handleTyping(true);
                    }
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e9ecef';
                    handleTyping(false);
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!currentMessage.trim() || !isConnected}
                  style={{
                    background: (currentMessage.trim() && isConnected)
                      ? 'linear-gradient(135deg, #666FD0 0%, #4c63d2 100%)' 
                      : '#e9ecef',
                    color: (currentMessage.trim() && isConnected) ? 'white' : '#6c757d',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    cursor: (currentMessage.trim() && isConnected) ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem',
                    transition: 'all 0.3s ease',
                    boxShadow: (currentMessage.trim() && isConnected) ? '0 4px 12px rgba(102, 111, 208, 0.3)' : 'none'
                  }}
                >
                  ➤
                </button>
              </div>
            </>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#6c757d',
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💼</div>
                <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>
                  Welcome to Your Lawyer Dashboard
                </h3>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  When clients message you, their conversations will appear in the sidebar
                </p>
                <p style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                  Select a conversation to start responding to your clients
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
