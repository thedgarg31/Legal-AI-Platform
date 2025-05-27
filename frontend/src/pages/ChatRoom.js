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
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const clientId = 'client_' + Date.now();

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
      
      const lawyerResult = await getLawyerById(lawyerId);
      if (lawyerResult.success) {
        setLawyer(lawyerResult.lawyer);
        console.log('✅ Lawyer details loaded:', lawyerResult.lawyer.personalInfo.fullName);
      }

      const chatResult = await createChatRoom({ lawyerId, clientId });
      if (chatResult.success) {
        const roomId = chatResult.chatRoom.chatRoomId;
        setChatRoomId(roomId);
        console.log('✅ Chat room created/found:', roomId);

        const newSocket = io('http://localhost:5000');
        setSocket(newSocket);

        newSocket.on('connect', () => {
          console.log('✅ Client socket connected:', newSocket.id);
          setIsConnected(true);
          newSocket.emit('user_join', { userId: clientId, userType: 'client' });
          newSocket.emit('join_chat', { lawyerId, clientId, chatRoomId: roomId });
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
          console.log('📥 Received message:', messageData);
          setMessages(prev => {
            const exists = prev.some(msg => msg.messageId === messageData.messageId);
            if (exists) return prev;
            return [...prev, messageData];
          });
        });

        newSocket.on('chat_history', (data) => {
          console.log('📜 Loading chat history:', data.messages);
          setMessages(data.messages || []);
        });

        newSocket.on('user_typing', (data) => {
          console.log('⌨️ Typing indicator:', data);
          setIsTyping(data.isTyping);
        });

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
      
      console.log('📤 Sending message:', messageData);
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

  // Theme colors (same as lawyer dashboard)
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

  if (loading) {
    return (
      <div style={{ 
        background: currentTheme.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ 
          textAlign: 'center',
          background: currentTheme.secondary,
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: `1px solid ${currentTheme.border}`
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: `4px solid ${currentTheme.border}`,
            borderTop: `4px solid ${currentTheme.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: currentTheme.text, fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
            Connecting to lawyer...
          </p>
        </div>
      </div>
    );
  }

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
          <Link to="/lawyers" style={{ 
            color: currentTheme.text, 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '6px',
            border: `1px solid ${currentTheme.border}`,
            transition: 'all 0.2s ease'
          }}>
            ← Back to Lawyers
          </Link>
          
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
              Client Portal
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
        </div>
      </div>

      {/* Chat Container */}
      <div style={{ 
        maxWidth: '1000px', 
        margin: '0 auto',
        height: 'calc(100vh - 60px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Chat Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${currentTheme.border}`,
          background: currentTheme.secondary
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: lawyer?.personalInfo.profilePhoto 
                ? `url(http://localhost:5000/uploads/lawyer-documents/${lawyer.personalInfo.profilePhoto})` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '24px',
              fontWeight: 'bold',
              border: `3px solid ${currentTheme.border}`
            }}>
              {!lawyer?.personalInfo.profilePhoto && lawyer?.personalInfo.fullName?.charAt(0)}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ 
                color: currentTheme.text, 
                margin: 0, 
                fontSize: '20px', 
                fontWeight: '600',
                marginBottom: '4px'
              }}>
                {lawyer?.personalInfo.fullName}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span style={{ 
                  color: currentTheme.textSecondary, 
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {lawyer?.availability.isOnline ? (
                    <>🟢 Online</>
                  ) : (
                    <>⚫ Offline</>
                  )}
                </span>
                <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>•</span>
                <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>
                  {lawyer?.credentials.specializations?.[0]}
                </span>
                <span style={{ color: currentTheme.textSecondary, fontSize: '14px' }}>•</span>
                <span style={{ 
                  color: currentTheme.accent, 
                  fontSize: '14px',
                  fontWeight: '600'
                }}>
                  ₹{lawyer?.availability.consultationFees}/consultation
                </span>
              </div>
            </div>
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
                  Start Your Legal Consultation
                </h3>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Send a message to {lawyer?.personalInfo.fullName} to begin your consultation
                </p>
              </div>
            </div>
          ) : (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
              {messages.map((message, index) => (
                <div key={message.messageId || index} style={{
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: message.senderType === 'client' ? 'flex-end' : 'flex-start',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <div style={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: message.senderType === 'client' ? 'row-reverse' : 'row',
                    alignItems: 'flex-end',
                    gap: '8px'
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: message.senderType === 'client' ? currentTheme.accent : currentTheme.tertiary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: message.senderType === 'client' ? 'white' : currentTheme.text,
                      fontSize: '14px',
                      fontWeight: '600',
                      flexShrink: 0
                    }}>
                      {message.senderType === 'client' ? '👤' : '⚖️'}
                    </div>

                    {/* Message Bubble */}
                    <div style={{
                      background: message.senderType === 'client' ? currentTheme.messageOwn : currentTheme.messageOther,
                      color: message.senderType === 'client' ? 'white' : currentTheme.text,
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
                        {message.senderType === 'client' ? 'You' : lawyer?.personalInfo.fullName}
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
                    ⚖️
                  </div>
                  <div style={{
                    background: currentTheme.messageOther,
                    color: currentTheme.text,
                    padding: '12px 16px',
                    borderRadius: '18px',
                    fontSize: '14px',
                    fontStyle: 'italic'
                  }}>
                    {lawyer?.personalInfo.fullName} is typing...
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
                placeholder="Type your legal question..."
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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

export default ChatRoom;
