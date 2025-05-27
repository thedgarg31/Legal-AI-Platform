import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const FindLawyers = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);

  // Updated lawyers using original names with new credentials
  const demoLawyers = [
    {
      _id: '68343b007976480a55bce7f5', // Dr. Rajesh Kumar's ID
      personalInfo: {
        fullName: 'Dr. Rajesh Kumar', // Original name from database
        email: 'lawyer1@legalpro.com', // New login email
        phone: '+91-9876543210',
        profilePhoto: null
      },
      credentials: {
        specializations: ['Corporate Law', 'Contract Law', 'Business Law'],
        experience: 8,
        advocateCode: 'ADV001'
      },
      availability: {
        consultationFees: 3000,
        isOnline: true
      },
      isDemo: true,
      loginCredentials: {
        email: 'lawyer1@legalpro.com',
        password: 'lawyer123'
      }
    },
    {
      _id: '68343b007976480a55bce7f6', // Advocate Priya Sharma's ID
      personalInfo: {
        fullName: 'Advocate Priya Sharma', // Original name from database
        email: 'lawyer2@legalpro.com', // New login email
        phone: '+91-9876543211',
        profilePhoto: null
      },
      credentials: {
        specializations: ['Criminal Law', 'Civil Rights', 'Family Law'],
        experience: 12,
        advocateCode: 'ADV002'
      },
      availability: {
        consultationFees: 4500,
        isOnline: true
      },
      isDemo: true,
      loginCredentials: {
        email: 'lawyer2@legalpro.com',
        password: 'lawyer456'
      }
    }
  ];

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
              {demoLawyers.length} Demo Lawyers Available
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
              {demoLawyers.map((lawyer) => (
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Demo Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: '#FF6B35',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                  }}>
                    Demo
                  </div>

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
                      background: lawyer.personalInfo.profilePhoto 
                        ? `url(http://localhost:5000/uploads/lawyer-documents/${lawyer.personalInfo.profilePhoto})` 
                        : lawyer.personalInfo.fullName === 'Dr. Rajesh Kumar' 
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                          : 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      flexShrink: 0,
                      border: `3px solid ${theme.border}`
                    }}>
                      {!lawyer.personalInfo.profilePhoto && lawyer.personalInfo.fullName.charAt(0)}
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
                          background: lawyer.availability.isOnline ? '#4CAF50' : '#F44336'
                        }}></div>
                        <span style={{
                          fontSize: '0.9rem',
                          color: lawyer.availability.isOnline ? '#4CAF50' : '#F44336',
                          fontWeight: '500'
                        }}>
                          {lawyer.availability.isOnline ? 'Online' : 'Offline'}
                        </span>
                      </div>
                      <p style={{
                        fontSize: '0.9rem',
                        color: theme.textSecondary,
                        margin: 0
                      }}>
                        {lawyer.credentials.experience} years experience
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
                      {lawyer.credentials.specializations.map((spec, index) => (
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
                      ₹{lawyer.availability.consultationFees.toLocaleString()}
                    </span>
                  </div>

                  {/* Action Button */}
                  <Link
                    to={`/chat/${lawyer._id}`}
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
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }}
                  >
                    Start Consultation
                  </Link>

                  {/* Demo Credentials Info */}
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#FFF3CD',
                    border: '1px solid #FFEAA7',
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}>
                    <strong style={{ color: '#856404' }}>Demo Login:</strong>
                    <br />
                    <span style={{ color: '#856404' }}>
                      {lawyer.loginCredentials.email} / {lawyer.loginCredentials.password}
                    </span>
                  </div>
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
