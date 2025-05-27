import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Contact = () => {
  const { theme } = useTheme();

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: theme.text,
      padding: '4rem 2rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Contact Us
        </h1>
        
        <div style={{
          background: theme.card,
          padding: '3rem',
          borderRadius: '16px',
          border: `1px solid ${theme.border}`,
          textAlign: 'left'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>📧 Email</h3>
            <p style={{ color: theme.textSecondary }}>support@legalchatpro.com</p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>📞 Phone</h3>
            <p style={{ color: theme.textSecondary }}>+1 (555) 123-4567</p>
          </div>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>🏢 Address</h3>
            <p style={{ color: theme.textSecondary }}>
              123 Legal Street<br/>
              Law District, LD 12345<br/>
              United States
            </p>
          </div>
          
          <div>
            <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>⏰ Business Hours</h3>
            <p style={{ color: theme.textSecondary }}>
              Monday - Friday: 9:00 AM - 6:00 PM<br/>
              Saturday: 10:00 AM - 4:00 PM<br/>
              Sunday: Closed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
