import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const FindLawyers = () => {
  const { theme } = useTheme();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLawyers();
  }, []);

  // ✅ DYNAMIC: Fetch ALL lawyers from database
  const fetchLawyers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/lawyers');
      const result = await response.json();
      
      if (result.success && result.lawyers) {
        setLawyers(result.lawyers);
      }
    } catch (error) {
      console.error('❌ Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      color: theme.text
    }}>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${theme.accent} 0%, #764ba2 100%)`,
        padding: '80px 0',
        textAlign: 'center',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '700',
            marginBottom: '1rem',
            margin: 0
          }}>
            Find Expert Lawyers
          </h1>
          <p style={{
            fontSize: '1.2rem',
            marginBottom: '2rem',
            opacity: 0.9,
            maxWidth: '600px',
            margin: '1rem auto 0 auto'
          }}>
            Connect with experienced legal professionals for your consultation needs
          </p>
        </div>
      </section>

      {/* Lawyers List */}
      <section style={{
        padding: '60px 0',
        background: theme.secondary
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '3rem'
          }}>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: theme.text,
              margin: 0
            }}>
              Available Lawyers
            </h2>
            <div style={{
              background: theme.accent + '20',
              color: theme.accent,
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              fontWeight: '600',
              border: `1px solid ${theme.accent}50`
            }}>
              {lawyers.length} Lawyers Available
            </div>
          </div>

          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '4rem'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: `4px solid ${theme.border}`,
                borderTop: `4px solid ${theme.accent}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {/* ✅ DYNAMIC: Render ALL lawyers from database */}
              {lawyers.map((lawyer) => (
                <div
                  key={lawyer._id}
                  style={{
                    background: theme.card,
                    borderRadius: '16px',
                    padding: '2rem',
                    border: `1px solid ${theme.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                >
                  {/* Lawyer Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      border: `3px solid ${theme.border}`
                    }}>
                      {lawyer.personalInfo.fullName.charAt(0)}
                    </div>

                    {/* Basic Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        color: theme.text,
                        margin: '0 0 0.5rem 0'
                      }}>
                        {lawyer.personalInfo.fullName}
                      </h3>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '0.5rem'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: lawyer.availability?.isOnline ? '#4CAF50' : '#F44336'
                        }}></div>
                        <span style={{
                          fontSize: '0.9rem',
                          color: lawyer.availability?.isOnline ? '#4CAF50' : '#F44336',
                          fontWeight: '500'
                        }}>
                          {lawyer.availability?.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.9rem',
                        color: theme.textSecondary,
                        margin: 0
                      }}>
                        {lawyer.credentials?.experience || 0} years experience
                      </p>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <h4 style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '0.5rem'
                    }}>
                      Specializations
                    </h4>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {(lawyer.credentials?.specializations || ['General Law']).map((spec, index) => (
                        <span
                          key={index}
                          style={{
                            background: theme.accent + '20',
                            color: theme.accent,
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            border: `1px solid ${theme.accent}30`
                          }}
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1.5rem',
                    padding: '1rem',
                    background: theme.tertiary,
                    borderRadius: '8px'
                  }}>
                    <span style={{
                      fontSize: '0.9rem',
                      color: theme.textSecondary
                    }}>
                      Consultation Fee
                    </span>
                    <span style={{
                      fontSize: '1.2rem',
                      fontWeight: '700',
                      color: theme.accent
                    }}>
                      ₹{(lawyer.availability?.consultationFees || 2000).toLocaleString()}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/chat/${lawyer._id}`} // ✅ DYNAMIC: Use actual lawyer ID
                    style={{
                      display: 'block',
                      width: '100%',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '12px',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Start Consultation
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FindLawyers;
