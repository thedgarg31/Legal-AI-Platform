import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const { user, isAuthenticated, logout, token } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  // ✅ ENHANCED: Dynamic lawyer dashboard navigation
  const handleLawyerDashboard = async () => {
    if (user?.isLawyer && user?.email) {
      try {
        console.log('🔄 Resolving active lawyer ID for:', user.email);
        
        // ✅ Find the lawyer ID that has chat activity
        const response = await fetch(`http://localhost:5000/api/chat/resolve-lawyer-id/${user.email}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        console.log('📊 Lawyer ID resolution result:', result);
        
        if (result.success && result.activeLawyerId) {
          console.log('✅ Navigating to active lawyer dashboard:', result.activeLawyerId);
          window.location.href = `/lawyer-dashboard/${result.activeLawyerId}`;
        } else {
          // Fallback to user's stored lawyer ID
          console.log('⚠️ Using fallback lawyer ID:', user.lawyerId);
          window.location.href = `/lawyer-dashboard/${user.lawyerId}`;
        }
      } catch (error) {
        console.error('❌ Error resolving lawyer ID:', error);
        // Fallback to user's stored lawyer ID
        if (user.lawyerId) {
          console.log('🔄 Using fallback lawyer ID due to error:', user.lawyerId);
          window.location.href = `/lawyer-dashboard/${user.lawyerId}`;
        } else {
          alert('Unable to access lawyer dashboard. Please contact support.');
        }
      }
    } else {
      console.error('❌ No lawyer email found for user:', user);
      alert('Unable to access lawyer dashboard. Please logout and login again.');
    }
    setIsUserMenuOpen(false);
  };

  return (
    <nav style={{
      background: theme.header,
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px'
      }}>
        
        {/* Compact Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            L
          </div>
          <span style={{
            fontSize: '18px',
            fontWeight: '700',
            color: theme.text,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
          }}>
            LegalPro
          </span>
        </Link>

        {/* Desktop Navigation - Clean & Minimal */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          
          {/* Main Navigation Links */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center'
          }}>
            {[
              { path: '/', label: 'Home' },
              { path: '/lawyers', label: 'Lawyers' },
              { path: '/document-analysis', label: 'Document Analysis' },
              { path: '/services', label: 'Services' },
              { path: '/about', label: 'About' },
              { path: '/contact', label: 'Contact' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  textDecoration: 'none',
                  color: isActive(path) ? theme.accent : theme.text,
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: isActive(path) ? `${theme.accent}10` : 'transparent',
                  transition: 'all 0.2s ease',
                  fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(path)) {
                    e.target.style.background = theme.tertiary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(path)) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            
            {/* Theme Toggle - Minimal */}
            <button
              onClick={toggleTheme}
              style={{
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: '6px',
                padding: '6px',
                cursor: 'pointer',
                color: theme.text,
                fontSize: '14px',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.tertiary;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              {isDarkMode ? '☀' : '🌙'}
            </button>

            {/* User Section */}
            {isAuthenticated ? (
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    background: theme.tertiary,
                    border: `1px solid ${theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = theme.accent + '20';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = theme.tertiary;
                  }}
                >
                  {/* User Avatar */}
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: user.profile?.profilePhoto 
                      ? `url(http://localhost:5000/uploads/profiles/${user.profile.profilePhoto})` 
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    position: 'relative'
                  }}>
                    {!user.profile?.profilePhoto && user.name?.charAt(0)}
                    
                    {/* Lawyer Badge */}
                    {user.isLawyer && (
                      <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '12px',
                        height: '12px',
                        background: '#4CAF50',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        color: 'white',
                        border: `2px solid ${theme.header}`
                      }}>
                        ✓
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: theme.text,
                      maxWidth: '100px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.name}
                    </span>
                    
                    {/* Lawyer Badge Text */}
                    {user.isLawyer && (
                      <span style={{
                        fontSize: '10px',
                        background: '#4CAF50',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        fontWeight: '600'
                      }}>
                        LAWYER
                      </span>
                    )}
                  </div>
                  
                  <span style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}>
                    ▼
                  </span>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    background: theme.card,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    minWidth: '200px',
                    zIndex: 1000
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: `1px solid ${theme.border}`
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: theme.text
                        }}>
                          {user.name}
                        </span>
                        {user.isLawyer && (
                          <span style={{
                            fontSize: '9px',
                            background: '#4CAF50',
                            color: 'white',
                            padding: '2px 4px',
                            borderRadius: '8px',
                            fontWeight: '600'
                          }}>
                            LAWYER
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: theme.textSecondary
                      }}>
                        {user.email}
                      </div>
                    </div>
                    
                    {/* Navigation Links */}
                    <div>
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: theme.text,
                          fontSize: '14px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = theme.tertiary;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <span>👤</span>
                        Profile
                      </Link>

                      <Link
                        to="/chat-history"
                        onClick={() => setIsUserMenuOpen(false)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '12px 16px',
                          textDecoration: 'none',
                          color: theme.text,
                          fontSize: '14px',
                          transition: 'background 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = theme.tertiary;
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <span>💬</span>
                        Chat History
                      </Link>

                      {/* ✅ ENHANCED: Dynamic Lawyer Dashboard */}
                      {user.isLawyer && (
                        <button
                          onClick={handleLawyerDashboard}
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: theme.text,
                            fontSize: '14px',
                            textAlign: 'left',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = theme.tertiary;
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                          }}
                        >
                          <span>⚖️</span>
                          Lawyer Dashboard
                        </button>
                      )}
                    </div>
                    
                    <div style={{
                      borderTop: `1px solid ${theme.border}`,
                      padding: '8px'
                    }}>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          color: theme.danger,
                          fontSize: '14px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = theme.danger + '10';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = 'transparent';
                        }}
                      >
                        <span>🚪</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/auth"
                  style={{
                    textDecoration: 'none',
                    background: 'transparent',
                    color: theme.text,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: `1px solid ${theme.border}`,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = theme.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  Sign In
                </Link>
                
                <Link
                  to="/lawyer-registration"
                  style={{
                    textDecoration: 'none',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  Join as Lawyer
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: theme.text,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ☰
        </button>
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default Navbar;
