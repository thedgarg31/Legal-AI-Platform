import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import { getLawyerById } from '../api/lawyers';
import { useTheme } from '../context/ThemeContext';
import DocumentAnalysis from '../components/DocumentAnalysis';

const LawyerDashboard = () => {
  const { lawyerId } = useParams();
  const { theme } = useTheme();
  const [socket, setSocket] = useState(null);
  const [lawyer, setLawyer] = useState(null);
  const [activeChats, setActiveChats] = useState([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState('');
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [documents, setDocuments] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let socketInstance = null;

    const initializeLawyerDashboard = async () => {
      try {
        console.log('🔄 Initializing lawyer dashboard for:', lawyerId);
        
        const lawyerResult = await getLawyerById(lawyerId);
        if (lawyerResult.success && mounted) {
          setLawyer(lawyerResult.lawyer);
          console.log('✅ Lawyer loaded:', lawyerResult.lawyer.personalInfo.fullName);
        }

        socketInstance = io('http://localhost:5000', {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true
        });
        
        setSocket(socketInstance);

        socketInstance.on('connect', () => {
          console.log('✅ Lawyer socket connected:', socketInstance.id);
          if (mounted) {
            setIsConnected(true);
            socketInstance.emit('user_join', { userId: lawyerId, userType: 'lawyer' });
            console.log('👨‍💼 Joined as lawyer:', lawyerId);
          }
        });

        socketInstance.on('connect_error', (error) => {
          console.error('❌ Socket connection error:', error);
          if (mounted) setIsConnected(false);
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('🔌 Socket disconnected:', reason);
          if (mounted) setIsConnected(false);
        });

        // ✅ Remove existing listeners before adding new ones
        socketInstance.off('receive_message');
        socketInstance.on('receive_message', (messageData) => {
          console.log('📥 LAWYER: Received message globally:', messageData);
          
          const chatRoomId = messageData.chatRoomId;
          
          if (chatRoomId && chatRoomId.includes(lawyerId) && mounted) {
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
              if (exists) {
                console.log('⚠️ Duplicate message prevented:', messageData.messageId);
                return prevMessages;
              }
              return [...prevMessages, messageData];
            });

            // If it's a document notification, refresh documents
            if (messageData.isDocumentNotification) {
              fetchDocuments(chatRoomId);
            }
          }
        });

        socketInstance.off('new_chat_room');
        socketInstance.on('new_chat_room', (data) => {
          console.log('🔔 New chat room notification:', data);
          const { chatRoomId } = data;
          
          if (mounted) {
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
          }
        });

        socketInstance.off('chat_history');
        socketInstance.on('chat_history', (data) => {
          console.log('📜 Lawyer loading chat history:', data.messages);
          if (mounted) setMessages(data.messages || []);
        });

        socketInstance.off('user_typing');
        socketInstance.on('user_typing', (data) => {
          console.log('⌨️ Client typing:', data);
          if (mounted) setIsTyping(data.isTyping);
        });

        socketInstance.off('user_joined_chat');
        socketInstance.on('user_joined_chat', (data) => {
          console.log('👋 User joined chat:', data);
        });

      } catch (error) {
        console.error('❌ Error initializing lawyer dashboard:', error);
      }
    };

    initializeLawyerDashboard();

    // ✅ CLEANUP: Remove all listeners and disconnect socket
    return () => {
      mounted = false;
      if (socketInstance) {
        socketInstance.off('connect');
        socketInstance.off('connect_error');
        socketInstance.off('disconnect');
        socketInstance.off('receive_message');
        socketInstance.off('new_chat_room');
        socketInstance.off('chat_history');
        socketInstance.off('user_typing');
        socketInstance.off('user_joined_chat');
        socketInstance.disconnect();
        console.log('🧹 Lawyer socket cleaned up and disconnected');
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

  // Fetch documents when chat room changes
  useEffect(() => {
    if (selectedChatRoom) {
      fetchDocuments(selectedChatRoom);
    }
  }, [selectedChatRoom]);

  const fetchDocuments = async (chatRoomId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/documents/chat/${chatRoomId}`);
      const result = await response.json();
      
      if (result.success) {
        setDocuments(result.documents);
        console.log('📄 Fetched documents for room:', chatRoomId, result.documents.length);
      }
    } catch (error) {
      console.error('❌ Error fetching documents:', error);
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

  const sendMessage = useCallback(() => {
    if (currentMessage.trim() && socket && selectedChatRoom && isConnected) {
      const messageData = {
        chatRoomId: selectedChatRoom,
        message: currentMessage,
        senderId: lawyerId,
        senderType: 'lawyer',
        messageId: `${Date.now()}_${lawyerId}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      };
      
      console.log('📤 Lawyer sending message:', messageData);
      
      // Clear input immediately
      setCurrentMessage('');
      
      // Add message to UI immediately (optimistic update)
      setMessages(prevMessages => {
        const exists = prevMessages.some(msg => msg.messageId === messageData.messageId);
        if (exists) return prevMessages;
        return [...prevMessages, messageData];
      });
      
      // Send to server
      socket.emit('send_message', messageData);
    }
  }, [currentMessage, socket, selectedChatRoom, isConnected, lawyerId]);

  const handleTyping = useCallback((typing) => {
    if (socket && selectedChatRoom && isConnected) {
      socket.emit('typing', { 
        chatRoomId: selectedChatRoom, 
        userId: lawyerId, 
        isTyping: typing 
      });
    }
  }, [socket, selectedChatRoom, isConnected, lawyerId]);

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

  return (
    <div style={{ 
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: theme.text
    }}>
      {/* Top Navigation Bar */}
      <div style={{
        background: theme.header,
        borderBottom: `1px solid ${theme.border}`,
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
              color: theme.text
            }}>
              LegalChat Pro - Lawyer Dashboard
            </h1>
            <p style={{ 
              margin: 0, 
              fontSize: '14px', 
              color: theme.textSecondary
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
            border: `1px solid ${isConnected ? theme.success : theme.danger}`
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? theme.success : theme.danger
            }} />
            <span style={{ 
              fontSize: '12px', 
              fontWeight: '500',
              color: isConnected ? theme.success : theme.danger
            }}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Active Chats Badge */}
          {activeChats.length > 0 && (
            <div style={{
              background: theme.accent,
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
          background: theme.sidebar,
          borderRight: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Sidebar Header */}
          <div style={{
            padding: '20px',
            borderBottom: `1px solid ${theme.border}`
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: '600',
              color: theme.text
            }}>
              Client Conversations
            </h3>
            <p style={{
              margin: 0,
              fontSize: '14px',
              color: theme.textSecondary
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
                      background: selectedChatRoom === chatRoomId ? theme.accent : 'transparent',
                      color: selectedChatRoom === chatRoomId ? 'white' : theme.text,
                      transition: 'all 0.2s ease',
                      border: selectedChatRoom === chatRoomId ? 'none' : `1px solid transparent`
                    }}
                    onMouseEnter={(e) => {
                      if (selectedChatRoom !== chatRoomId) {
                        e.target.style.background = theme.tertiary;
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
                        background: selectedChatRoom === chatRoomId ? 'rgba(255,255,255,0.2)' : theme.accent,
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
                          background: theme.success
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
                color: theme.textSecondary
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>💬</div>
                <h4 style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px',
                  color: theme.text
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
                borderBottom: `1px solid ${theme.border}`,
                background: theme.secondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: theme.accent,
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
                      color: theme.text
                    }}>
                      {formatChatRoomName(selectedChatRoom)}
                    </h3>
                    <p style={{ 
                      margin: 0, 
                      fontSize: '14px', 
                      color: theme.textSecondary
                    }}>
                      Legal consultation in progress
                    </p>
                  </div>
                </div>
                
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '16px',
                  background: 'rgba(76, 175, 80, 0.1)',
                  border: `1px solid ${theme.success}`,
                  color: theme.success,
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  🟢 Live Chat
                </div>
              </div>

              {/* Documents Tab */}
              <div style={{
                padding: '1rem 24px',
                borderBottom: `1px solid ${theme.border}`,
                background: theme.secondary
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  maxWidth: '800px',
                  margin: '0 auto'
                }}>
                  <h4 style={{
                    color: theme.text,
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: '600'
                  }}>
                    📄 Client Documents ({documents.length})
                  </h4>
                </div>
                
                {documents.length > 0 && (
                  <div style={{
                    maxWidth: '800px',
                    margin: '1rem auto 0 auto',
                    maxHeight: '300px',
                    overflowY: 'auto'
                  }}>
                    {documents.map((doc, index) => (
                      <DocumentAnalysis key={doc._id || index} document={doc} />
                    ))}
                  </div>
                )}
              </div>

              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '24px',
                background: theme.primary
              }}>
                {messages.length === 0 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    textAlign: 'center',
                    color: theme.textSecondary
                  }}>
                    <div>
                      <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>💬</div>
                      <h3 style={{ 
                        margin: '0 0 8px 0', 
                        fontSize: '18px',
                        color: theme.text
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
                            background: message.senderType === 'lawyer' ? theme.accent : theme.tertiary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: message.senderType === 'lawyer' ? 'white' : theme.text,
                            fontSize: '14px',
                            fontWeight: '600',
                            flexShrink: 0
                          }}>
                            {message.senderType === 'lawyer' ? '⚖️' : '👤'}
                          </div>

                          {/* Message Bubble */}
                          <div style={{
                            background: message.isDocumentNotification 
                              ? `${theme.accent}20` 
                              : message.senderType === 'lawyer' 
                                ? theme.messageOwn 
                                : theme.messageOther,
                            color: message.isDocumentNotification 
                              ? theme.accent 
                              : message.senderType === 'lawyer' 
                                ? 'white' 
                                : theme.text,
                            padding: '12px 16px',
                            borderRadius: '18px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            position: 'relative',
                            border: message.isDocumentNotification ? `1px solid ${theme.accent}50` : 'none'
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
                          background: theme.tertiary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }}>
                          👤
                        </div>
                        <div style={{
                          background: theme.messageOther,
                          color: theme.text,
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
                borderTop: `1px solid ${theme.border}`,
                background: theme.secondary
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
                        border: `1px solid ${theme.border}`,
                        borderRadius: '22px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        background: theme.primary,
                        color: theme.text,
                        outline: 'none',
                        resize: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                      onFocus={(e) => {
                        if (isConnected) {
                          e.target.style.borderColor = theme.accent;
                          handleTyping(true);
                        }
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = theme.border;
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
                      background: (currentMessage.trim() && isConnected) ? theme.accent : theme.tertiary,
                      color: (currentMessage.trim() && isConnected) ? 'white' : theme.textSecondary,
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
                        e.target.style.background = theme.accentHover;
                        e.target.style.transform = 'scale(1.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentMessage.trim() && isConnected) {
                        e.target.style.background = theme.accent;
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
              background: theme.primary,
              textAlign: 'center'
            }}>
              <div>
                <div style={{ fontSize: '96px', marginBottom: '24px', opacity: 0.3 }}>⚖️</div>
                <h2 style={{ 
                  margin: '0 0 16px 0', 
                  fontSize: '24px', 
                  fontWeight: '600',
                  color: theme.text
                }}>
                  Welcome to LegalChat Pro
                </h2>
                <p style={{ 
                  margin: '0 0 8px 0', 
                  fontSize: '16px', 
                  color: theme.textSecondary,
                  maxWidth: '400px'
                }}>
                  Select a conversation from the sidebar to start responding to your clients
                </p>
                <p style={{ 
                  margin: 0, 
                  fontSize: '14px', 
                  color: theme.textSecondary
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
          background: ${theme.secondary};
        }

        ::-webkit-scrollbar-thumb {
          background: ${theme.border};
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${theme.textSecondary};
        }

        textarea::-webkit-scrollbar {
          width: 4px;
        }
      `}</style>
    </div>
  );
};

export default LawyerDashboard;
