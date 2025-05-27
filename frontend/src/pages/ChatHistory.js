import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ChatHistory = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [chatRooms, setChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatHistory();
  }, [user]);

  const fetchChatHistory = async () => {
    try {
      if (!user) return;

      const response = await fetch(`http://localhost:5000/api/chat/rooms/${user.id}?userType=${user.userType}`);
      const result = await response.json();

      if (result.success) {
        setChatRooms(result.chatRooms);
      }
    } catch (error) {
      console.error('❌ Error fetching chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{
        background: theme.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div>Loading chat history...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: theme.text,
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '600',
          marginBottom: '2rem',
          color: theme.text
        }}>
          💬 Chat History
        </h1>

        {chatRooms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: theme.card,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>
              No Chat History
            </h3>
            <p style={{ color: theme.textSecondary }}>
              Start a conversation with a lawyer to see your chat history here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {chatRooms.map((room, index) => (
              <div
                key={room._id || index}
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
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.card;
                }}
                onClick={() => {
                  if (user.userType === 'client') {
                    window.location.href = `/chat/${room.lawyerId._id}`;
                  } else {
                    window.location.href = `/lawyer-dashboard/${user.id}`;
                  }
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      color: theme.text
                    }}>
                      {user.userType === 'client' 
                        ? room.lawyerId?.personalInfo?.fullName || 'Lawyer'
                        : room.clientId?.name || 'Client'
                      }
                    </h3>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.9rem',
                      color: theme.textSecondary
                    }}>
                      {user.userType === 'client' ? 'Legal Consultation' : 'Client Consultation'}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '0.8rem',
                    color: theme.textSecondary
                  }}>
                    {formatDate(room.lastMessageTime)}
                  </span>
                </div>

                {room.lastMessage && (
                  <div style={{
                    background: theme.tertiary,
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: theme.textSecondary
                  }}>
                    <strong>Last message:</strong> {room.lastMessage}
                  </div>
                )}

                <div style={{
                  marginTop: '1rem',
                  fontSize: '0.8rem',
                  color: theme.accent,
                  fontWeight: '500'
                }}>
                  Click to continue conversation →
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
