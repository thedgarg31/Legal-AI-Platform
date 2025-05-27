import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme, theme } = useTheme();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      background: theme.header,
      borderBottom: `1px solid ${theme.border}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '70px'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '20px',
            fontWeight: 'bold'
          }}>
            ⚖️
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: theme.text,
              fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
            }}>
              LegalChat Pro
            </h1>
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: theme.textSecondary,
              fontWeight: '500'
            }}>
              Professional Legal Platform
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {[
              { path: '/', label: 'Home' },
              { path: '/about', label: 'About' },
              { path: '/services', label: 'Services' },
              { path: '/lawyers', label: 'Find Lawyers' },
              { path: '/document-analysis', label: '📄 Document Analysis' }, // NEW OPTION
              { path: '/contact', label: 'Contact' }
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  textDecoration: 'none',
                  color: isActive(path) ? theme.accent : theme.text,
                  fontSize: '16px',
                  fontWeight: '500',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: isActive(path) ? `${theme.accent}15` : 'transparent',
                  border: isActive(path) ? `1px solid ${theme.accent}` : '1px solid transparent',
                  transition: 'all 0.3s ease',
                  fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!isActive(path)) {
                    e.target.style.background = theme.tertiary;
                    e.target.style.color = theme.text;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(path)) {
                    e.target.style.background = 'transparent';
                    e.target.style.color = theme.text;
                  }
                }}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Theme Toggle & CTA */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              style={{
                background: theme.tertiary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '8px 12px',
                cursor: 'pointer',
                color: theme.text,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s ease',
                fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.accent;
                e.target.style.color = 'white';
                e.target.style.borderColor = theme.accent;
              }}
              onMouseLeave={(e) => {
                e.target.style.background = theme.tertiary;
                e.target.style.color = theme.text;
                e.target.style.borderColor = theme.border;
              }}
            >
              {isDarkMode ? '☀️' : '🌙'}
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Join as Lawyer Button */}
            <Link
              to="/lawyer-registration"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
              }}
            >
              Join as Lawyer
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: theme.text,
            cursor: 'pointer',
            '@media (max-width: 768px)': {
              display: 'block'
            }
          }}
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div style={{
          background: theme.secondary,
          borderTop: `1px solid ${theme.border}`,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {[
            { path: '/', label: 'Home' },
            { path: '/about', label: 'About' },
            { path: '/services', label: 'Services' },
            { path: '/lawyers', label: 'Find Lawyers' },
            { path: '/document-analysis', label: '📄 Document Analysis' }, // NEW OPTION
            { path: '/contact', label: 'Contact' }
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setIsMenuOpen(false)}
              style={{
                textDecoration: 'none',
                color: theme.text,
                fontSize: '16px',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '8px',
                background: isActive(path) ? theme.accent : 'transparent',
                transition: 'all 0.3s ease'
              }}
            >
              {label}
            </Link>
          ))}
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <button
              onClick={toggleTheme}
              style={{
                flex: 1,
                background: theme.tertiary,
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                padding: '12px',
                color: theme.text,
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            
            <Link
              to="/lawyer-registration"
              onClick={() => setIsMenuOpen(false)}
              style={{
                flex: 1,
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                textAlign: 'center'
              }}
            >
              Join as Lawyer
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
