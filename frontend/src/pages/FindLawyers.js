import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getAllLawyers } from '../api/lawyers';

const FindLawyers = () => {
  const { theme } = useTheme();
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('');

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const result = await getAllLawyers();
      if (result.success) {
        setLawyers(result.lawyers);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLawyers = lawyers.filter(lawyer => {
    const matchesSearch = lawyer.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === '' || 
      lawyer.credentials.specializations.includes(selectedSpecialization);
    return matchesSearch && matchesSpecialization;
  });

  const specializations = [...new Set(lawyers.flatMap(lawyer => lawyer.credentials.specializations))];

  if (loading) {
    return (
      <div style={{
        background: theme.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.secondary,
          padding: '3rem',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
          <p style={{ color: theme.text, fontSize: '1.1rem', fontWeight: '500', margin: 0 }}>
            Loading lawyers...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: theme.text
    }}>
      {/* Header Section */}
      <div style={{
        background: theme.secondary,
        borderBottom: `1px solid ${theme.border}`,
        padding: '3rem 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
            color: theme.text
          }}>
            Find Expert Lawyers
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: theme.textSecondary,
            marginBottom: '2rem'
          }}>
            Connect with qualified legal professionals for instant consultation
          </p>

          {/* Search and Filter */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: '600px',
            margin: '0 auto',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search lawyers by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '12px 16px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '16px',
                background: theme.primary,
                color: theme.text,
                outline: 'none'
              }}
            />
            <select
              value={selectedSpecialization}
              onChange={(e) => setSelectedSpecialization(e.target.value)}
              style={{
                padding: '12px 16px',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                fontSize: '16px',
                background: theme.primary,
                color: theme.text,
                outline: 'none',
                minWidth: '200px'
              }}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lawyers Grid */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '3rem 2rem'
      }}>
        {filteredLawyers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: theme.secondary,
            borderRadius: '12px',
            border: `1px solid ${theme.border}`
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem', opacity: 0.5 }}>👨‍💼</div>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>No lawyers found</h3>
            <p style={{ color: theme.textSecondary }}>Try adjusting your search criteria</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {filteredLawyers.map((lawyer) => (
              <div
                key={lawyer._id}
                style={{
                  background: theme.card,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '16px',
                  padding: '2rem',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.cardHover;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.card;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: lawyer.personalInfo.profilePhoto 
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
                    border: `3px solid ${theme.border}`
                  }}>
                    {!lawyer.personalInfo.profilePhoto && lawyer.personalInfo.fullName.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: 0,
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      color: theme.text,
                      marginBottom: '0.25rem'
                    }}>
                      {lawyer.personalInfo.fullName}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: lawyer.availability.isOnline ? theme.success : theme.textSecondary
                      }} />
                      <span style={{
                        fontSize: '14px',
                        color: lawyer.availability.isOnline ? theme.success : theme.textSecondary,
                        fontWeight: '500'
                      }}>
                        {lawyer.availability.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    {lawyer.credentials.specializations.map((spec, index) => (
                      <span
                        key={index}
                        style={{
                          background: `${theme.accent}15`,
                          color: theme.accent,
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '500',
                          border: `1px solid ${theme.accent}30`
                        }}
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: theme.textSecondary,
                    marginBottom: '1rem'
                  }}>
                    <span>📍 {lawyer.personalInfo.location}</span>
                    <span>⭐ {lawyer.credentials.experience} years</span>
                  </div>

                  <div style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: theme.accent,
                    textAlign: 'center',
                    marginBottom: '1rem'
                  }}>
                    ₹{lawyer.availability.consultationFees}/consultation
                  </div>
                </div>

                <Link
                  to={`/chat/${lawyer._id}`}
                  style={{
                    display: 'block',
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                  }}
                >
                  Start Consultation
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

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
