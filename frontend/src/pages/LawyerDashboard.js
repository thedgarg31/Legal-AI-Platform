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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    initializeLawyerDashboard();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [lawyerId]);

  // Auto-join chat room when selectedChatRoom changes
  useEffect(() => {
    if (selectedChatRoom && socket && isConnected) {
      const clientId = selectedChatRoom.split('_')[2];
      console.log('🔄 Auto-joining selected room:', selectedChatRoom);
      socket.emit('join_chat', { lawyerId, clientId, chatRoomId: selectedChatRoom });
    }
  }, [selectedChatRoom, socket, isConnected, lawyerId]);

  const initializeLawyerDashboard = async () => {
    try {
      console.log('🔄 Initializing lawyer dashboard for:', lawyerId);
      
      const lawyerResult = await getLawyerById(lawyerId);
      if (lawyerResult.success) {
        setLawyer(lawyerResult.lawyer);
        console.log('✅ Lawyer loaded:', lawyerResult.lawyer.personalInfo.fullName);
      }

      const newSocket = io('http://localhost:5000', {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      
      setSocket(newSocket);

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

      newSocket.on('receive_message', (messageData) => {
        console.log('📥 LAWYER: Received message globally:', messageData);
        
        const chatRoomId = messageData.chatRoomId;
        
        if (chatRoomId && chatRoomId.includes(lawyerId)) {
          console.log('✅ Message is for this lawyer, processing...');
          
          setActiveChats(prevChats => {
            if (!prevChats.includes(chatRoomId)) {
              console.log('✅ Adding new chat room to UI:', chatRoomId);
              return [...prevChats, chatRoomId];
            }
            return prevChats;
          });

          setSelectedChatRoom(prevRoom => {
            if (!prevRoom || prevRoom !== chatRoomId) {
              console.log('🎯 Auto-selecting chat room:', chatRoomId);
              setMessages([]);
              return chatRoomId;
            }
            return prevRoom;
          });

          setMessages(prevMessages => {
            const exists = prevMessages.some(msg => msg.messageId === messageData.messageId);
            return exists ? prevMessages : [...prevMessages, messageData];
          });
        }
      });

      newSocket.on('new_chat_room', (data) => {
        console.log('🔔 New chat room notification:', data);
        const { chatRoomId } = data;
        
        setActiveChats(prevChats => {
          if (!prevChats.includes(chatRoomId)) {
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

      newSocket.on('chat_history', (data) => {
        console.log('📜 Lawyer loading chat history:', data.messages);
        setMessages(data.messages || []);
      });

      newSocket.on('user_typing', (data) => {
        console.log('⌨️ Client typing:', data);
        setIsTyping(data.isTyping);
      });

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
      setMessages([]);
      
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
      senderType: 'lawyer',
      messageId: Date.now().toString(),
      timestamp: new Date()
    };
    
    console.log('📤 Lawyer sending message:', messageData);
    
    // CRITICAL FIX: Add message to UI immediately (optimistic update)
    setMessages(prevMessages => [...prevMessages, messageData]);
    
    // Send to server
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

  // Theme colors
  const theme = {
    dark: {
      primary: '#1a1a1a',
      secondary: '#2d2d30',
      tertiary: '#3e3e42',
      accent: '#007acc',
      accentHover: '#106ebe',
      text: '#cccccc',
      textSecondary: '#969696',
      border: '#464647',
      success: '#4caf50',
      danger: '#f44336',
      warning: '#ff9800',
      messageOwn: '#007acc',
      messageOther: '#3e3e42',
      sidebar: '#252526',
      header: '#2d2d30'
    },
    light: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      tertiary: '#e9ecef',
      accent: '#0066cc',
      accentHover: '#0052a3',
      text: '#212529',
      textSecondary: '#6c757d',
      border: '#dee2e6',
      success: '#28a745',
      danger: '#dc3545',
      warning: '#ffc107',
      messageOwn: '#0066cc',
      messageOther: '#e9ecef',
      sidebar: '#f8f9fa',
      header: '#ffffff'
    }
  };

  const currentTheme = isDarkMode ? theme.dark : theme.light;

  return (
    <div style={{ 
      background: currentTheme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: currentTheme.text
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: currentTheme.header,
        borderBottom: `1px solid ${currentTheme.border}`,
        padding: '0 24px',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            ⚖️
          </div>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '20px', 
              fontWeight: '600',
              color: currentTheme.text
            }}>
              LegalChat Pro
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: currentTheme.textSecondary
            }}>
              {lawyer?.personalInfo.fullName || 'Loading...'}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Connection Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '16px',
            background: isConnected ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            border: `1px solid ${isConnected ? currentTheme.success : currentTheme.danger}`
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? currentTheme.success : currentTheme.danger
            }} />
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '500',
              color: isConnected ? currentTheme.success : currentTheme.danger
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            style={{
              background: 'none',
              border: `1px solid ${currentTheme.border}`,
              borderRadius: '6px',
              padding: '8px',
              cursor: 'pointer',
              color: currentTheme.text,
              fontSize: '16px'
            }}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

          {/* Active Chats Badge */}
          {activeChats.length > 0 && (
            <div style={{
              background: currentTheme.accent,
              color: 'white',
              borderRadius: '12px',
              padding: '4px 8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {activeChats.length} Active
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', height: 'calc(100vh - 60px)' }}>
        {/* Sidebar */}
        <div style={{
          width: '320px',
          background: currentTheme.sidebar,
          borderRight: `1px solid ${currentTheme.border}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${currentTheme.border}`
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: currentTheme.text
            }}>
              Client Conversations
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: currentTheme.textSecondary
            }}>
              {activeChats.length} active conversation{activeChats.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Chat List */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeChats.length > 0 ? (
              <div style={{ padding: '8px' }}>
                {activeChats.map(chatRoomId => (
                  <div
                    key={chatRoomId}
                    onClick={() => joinChatRoom(chatRoomId)}
                    style={{
                      padding: '12px 16px',
                      margin: '4px 0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      background: selectedChatRoom === chatRoomId ? currentTheme.accent : 'transparent',
                      color: selectedChatRoom === chatRoomId ? 'white' : currentTheme.text,
                      transition: 'all 0.2s ease',
                      border: selectedChatRoom === chatRoomId ? 'none' : `1px solid transparent`
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChatRoom !== chatRoomId) {
                        e.target.style.background = currentTheme.tertiary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedChatRoom !== chatRoomId) {
                        e.target.style.background = 'transparent';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: selectedChatRoom === chatRoomId ? 'rgba(255,255,255,0.2)' : currentTheme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        👤
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '500',
                          marginBottom: '2px'
                        }}>
                          {formatChatRoomName(chatRoomId)}
                        </div>
                        <div style={{ 
                          fontSize: '12px', 
                          opacity: 0.7
                        }}>
                          Click to respond
                        </div>
                      </div>
                      {selectedChatRoom === chatRoomId && (
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: currentTheme.success
                        }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: currentTheme.textSecondary
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>💬</div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px',
                  color: currentTheme.text
                }}>
                  No active conversations
                </h4>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  lineHeight: '1.4'
                }}>
                  When clients message you, their conversations will appear here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedChatRoom ? (
            <>
              {/* Chat Header */}
              <div style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${currentTheme.border}`,
                background: currentTheme.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: currentTheme.accent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    👤
                  </div>
                  <div>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '16px', 
                      fontWeight: '600',
                      color: currentTheme.text
                    }}>
                      {formatChatRoomName(selectedChatRoom)}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      color: currentTheme.textSecondary
                    }}>
                      Legal consultation in progress
                    </p>
                  </div>
                </div>
                
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: `1px solid ${currentTheme.success}`,
                  color: currentTheme.success,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🟢 Live Chat
                </div>
              </div>

              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '24px',
                background: currentTheme.primary
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: currentTheme.textSecondary
                  }}>
                    <div>
                      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>💬</div>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '18px',
                        color: currentTheme.text
                      }}>
                        Conversation started
                      </h3>
                      <p style={{ margin: 0, fontSize: '14px' }}>
                        Loading message history...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {messages.map((message, index) => (
                      <div key={message.messageId || index} style={{
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: message.senderType === 'lawyer' ? 'flex-end' : 'flex-start',
                        animation: 'slideIn 0.3s ease-out'
                      }}>
                        <div style={{
                          maxWidth: '70%',
                          display: 'flex',
                          flexDirection: message.senderType === 'lawyer' ? 'row-reverse' : 'row',
                          alignItems: 'flex-end',
                          gap: '8px'
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: message.senderType === 'lawyer' ? currentTheme.accent : currentTheme.tertiary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: message.senderType === 'lawyer' ? 'white' : currentTheme.text,
                            fontSize: '14px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {message.senderType === 'lawyer' ? '⚖️' : '👤'}
                          </div>

                          {/* Message Bubble */}
                          <div style={{
                            background: message.senderType === 'lawyer' ? currentTheme.messageOwn : currentTheme.messageOther,
                            color: message.senderType === 'lawyer' ? 'white' : currentTheme.text,
                            padding: '12px 16px',
                            borderRadius: '18px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            position: 'relative'
                          }}>
                            {/* Sender Name */}
                            <div style={{
                              fontSize: '12px',
                              fontWeight: '600',
                              marginBottom: '4px',
                              opacity: 0.8
                            }}>
                              {message.senderType === 'lawyer' ? 'You' : 'Client'}
                            </div>
                            
                            {/* Message Text */}
                            <div style={{
                              fontSize: '14px',
                              lineHeight: '1.4',
                              wordBreak: 'break-word'
                            }}>
                              {message.message}
                            </div>
                            
                            {/* Timestamp */}
                            <div style={{
                              fontSize: '11px',
                              opacity: 0.6,
                              marginTop: '4px',
                              textAlign: 'right'
                            }}>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '8px',
                        marginBottom: '16px',
                        animation: 'pulse 1.5s infinite'
                      }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: currentTheme.tertiary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }}>
                          👤
                        </div>
                        <div style={{
                          background: currentTheme.messageOther,
                          color: currentTheme.text,
                          padding: '12px 16px',
                          borderRadius: '18px',
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          Client is typing...
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div style={{
                padding: '20px 24px',
                borderTop: `1px solid ${currentTheme.border}`,
                background: currentTheme.secondary
              }}>
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-end',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      placeholder="Type your professional response..."
                      disabled={!isConnected}
                      rows={1}
                      style={{
                        width: '100%',
                        minHeight: '44px',
                        maxHeight: '120px',
                        padding: '12px 16px',
                        border: `1px solid ${currentTheme.border}`,
                        borderRadius: '22px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: currentTheme.primary,
                        color: currentTheme.text,
                        outline: 'none',
                        resize: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (isConnected) {
                          e.target.style.borderColor = currentTheme.accent;
                          handleTyping(true);
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = currentTheme.border;
                        handleTyping(false);
                      }}
                    />
                  </div>
                  
                  <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim() || !isConnected}
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      border: 'none',
                      background: (currentMessage.trim() && isConnected) ? currentTheme.accent : currentTheme.tertiary,
                      color: (currentMessage.trim() && isConnected) ? 'white' : currentTheme.textSecondary,
                      cursor: (currentMessage.trim() && isConnected) ? 'pointer' : 'not-allowed',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      transition: 'all 0.2s ease',
                      transform: (currentMessage.trim() && isConnected) ? 'scale(1)' : 'scale(0.95)'
                    }}
                    onMouseEnter={(e) => {
                      if (currentMessage.trim() && isConnected) {
                        e.target.style.background = currentTheme.accentHover;
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentMessage.trim() && isConnected) {
                        e.target.style.background = currentTheme.accent;
                        e.target.style.transform = 'scale(1)';
                      }
                    }}
                  >
                    ➤
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: currentTheme.primary,
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '96px', marginBottom: '24px', opacity: 0.3 }}>⚖️</div>
                <h2 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: currentTheme.text
                }}>
                  Welcome to LegalChat Pro
                </h2>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  color: currentTheme.textSecondary,
                  maxWidth: '400px'
                }}>
                  Select a conversation from the sidebar to start responding to your clients
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: currentTheme.textSecondary
                }}>
                  Professional legal consultations made simple
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: ${currentTheme.secondary};
        }

        ::-webkit-scrollbar-thumb {
          background: ${currentTheme.border};
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${currentTheme.textSecondary};
        }

        textarea::-webkit-scrollbar {
          width: 4px;
        }
      `}</style>
    </div>
  );
};

export default LawyerDashboard;
