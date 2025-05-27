import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ChatHistory = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeLawyerId, setActiveLawyerId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchChatHistory();
    }
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      if (!user) return;

      let response;
      let resolvedLawyerId = null;
      
      // ✅ ENHANCED: Use dynamic lawyer ID resolution for lawyers
      if (user.isLawyer && user.email) {
        console.log('🔍 Resolving active lawyer ID for chat history:', user.email);
        
        try {
          const resolveResponse = await fetch(`http://localhost:5000/api/chat/resolve-lawyer-id/${user.email}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const resolveResult = await resolveResponse.json();
          if (resolveResult.success && resolveResult.activeLawyerId) {
            resolvedLawyerId = resolveResult.activeLawyerId;
            setActiveLawyerId(resolvedLawyerId);
            console.log('✅ Resolved lawyer ID for chat history:', resolvedLawyerId);
          }
        } catch (resolveError) {
          console.error('❌ Error resolving lawyer ID:', resolveError);
          resolvedLawyerId = user.lawyerId; // Fallback
        }
        
        // Use resolved lawyer ID or fallback
        const lawyerIdToUse = resolvedLawyerId || user.lawyerId;
        if (lawyerIdToUse) {
          console.log('🔍 Fetching lawyer chat history for ID:', lawyerIdToUse);
          response = await fetch(`http://localhost:5000/api/chat/lawyer-rooms/${lawyerIdToUse}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
        } else {
          console.error('❌ No lawyer ID available for chat history');
          setError('No lawyer ID available');
          setLoading(false);
          return;
        }
      } else {
        console.log('🔍 Fetching client chat history for ID:', user.id);
        response = await fetch(`http://localhost:5000/api/chat/rooms/${user.id}?userType=${user.userType}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      const result = await response.json();
      console.log('📜 Chat history result:', result);

      if (result.success) {
        setChatRooms(result.chatRooms || []);
      } else {
        setError(result.message || 'Failed to load chat history');
      }
    } catch (error) {
      console.error('❌ Error fetching chat history:', error);
      setError('Failed to load chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleChatClick = async (room) => {
    // ✅ ENHANCED: Navigate based on user type with dynamic lawyer ID
    if (user.isLawyer) {
      try {
        // Use the resolved active lawyer ID or resolve it again
        let lawyerIdToUse = activeLawyerId;
        
        if (!lawyerIdToUse && user.email) {
          const resolveResponse = await fetch(`http://localhost:5000/api/chat/resolve-lawyer-id/${user.email}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          const resolveResult = await resolveResponse.json();
          if (resolveResult.success && resolveResult.activeLawyerId) {
            lawyerIdToUse = resolveResult.activeLawyerId;
          }
        }
        
        // Fallback to user's stored lawyer ID
        lawyerIdToUse = lawyerIdToUse || user.lawyerId;
        
        if (lawyerIdToUse) {
          console.log('🔄 Lawyer clicking chat, going to dashboard:', lawyerIdToUse);
          window.location.href = `/lawyer-dashboard/${lawyerIdToUse}`;
        } else {
          console.error('❌ No lawyer ID available for navigation');
          alert('Unable to access lawyer dashboard');
        }
      } catch (error) {
        console.error('❌ Error resolving lawyer dashboard navigation:', error);
        // Fallback to user's stored lawyer ID
        if (user.lawyerId) {
          window.location.href = `/lawyer-dashboard/${user.lawyerId}`;
        }
      }
    } else {
      const lawyerId = room.lawyerId?._id || room.lawyerId;
      console.log('🔄 Client clicking chat, going to lawyer:', lawyerId);
      window.location.href = `/chat/${lawyerId}`;
    }
  };

  const getChatPartnerInfo = (room) => {
    if (user.isLawyer) {
      // For lawyers, show client info
      return {
        name: room.clientName || room.clientId?.name || 'Client',
        type: 'Client consultation',
        avatar: 'C'
      };
    } else {
      // For clients, show lawyer info
      return {
        name: room.lawyerName || room.lawyerId?.personalInfo?.fullName || 'Lawyer',
        type: 'Legal consultation',
        avatar: 'L'
      };
    }
  };

  if (loading) {
    return (
      <div style={{
        background: theme.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.card,
          padding: '2rem',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${theme.border}`,
            borderTop: `4px solid ${theme.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: theme.text, margin: 0 }}>
            Loading chat history...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      color: theme.text,
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            margin: '0 0 0.5rem 0',
            color: theme.text
          }}>
            💬 Chat History
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '1.1rem',
            margin: 0
          }}>
            {user.isLawyer 
              ? `Your client consultations and conversations${activeLawyerId ? ` (ID: ${activeLawyerId})` : ''}`
              : 'Your legal consultations and conversations'
            }
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: `${theme.danger}20`,
            color: theme.danger,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${theme.danger}50`
          }}>
            {error}
          </div>
        )}

        {/* Chat Rooms */}
        {chatRooms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: theme.card,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>
              {user.isLawyer ? '⚖️' : '📝'}
            </div>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>
              No Chat History
            </h3>
            <p style={{ color: theme.textSecondary, marginBottom: '1.5rem' }}>
              {user.isLawyer 
                ? 'When clients message you, their conversations will appear here.'
                : 'Start a conversation with a lawyer to see your chat history here.'
              }
            </p>
            {!user.isLawyer && (
              <a 
                href="/lawyers"
                style={{
                  background: theme.accent,
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  display: 'inline-block'
                }}
              >
                Find Lawyers
              </a>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatRooms.map((room, index) => {
              const partnerInfo = getChatPartnerInfo(room);
              
              return (
                <div
                  key={room._id || room.chatRoomId || index}
                  onClick={() => handleChatClick(room)}
                  style={{
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.cardHover;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.card;
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: theme.accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: '600'
                      }}>
                        {partnerInfo.avatar}
                      </div>
                      <div>
                        <h3 style={{
                          margin: 0,
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: theme.text
                        }}>
                          {partnerInfo.name}
                        </h3>
                        <p style={{
                          margin: '0.25rem 0 0 0',
                          fontSize: '0.9rem',
                          color: theme.textSecondary
                        }}>
                          {partnerInfo.type}
                        </p>
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: user.isLawyer ? '#4CAF50' : theme.accent,
                      color: 'white',
                      fontSize: '0.7rem',
                      fontWeight: '600'
                    }}>
                      {user.isLawyer ? 'CLIENT' : 'LAWYER'}
                    </div>
                  </div>

                  {room.lastMessage && (
                    <div style={{
                      background: theme.tertiary,
                      padding: '0.75rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      color: theme.textSecondary,
                      marginBottom: '1rem'
                    }}>
                      <strong>Last message:</strong> {room.lastMessage}
                    </div>
                  )}

                  <div style={{
                    fontSize: '0.8rem',
                    color: theme.accent,
                    fontWeight: '500'
                  }}>
                    {user.isLawyer 
                      ? 'Click to open lawyer dashboard →'
                      : 'Click to continue conversation →'
                    }
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
