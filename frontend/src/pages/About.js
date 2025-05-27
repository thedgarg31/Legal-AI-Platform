import React from 'react';
import { useTheme } from '../context/ThemeContext';

const About = () => {
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
        maxWidth: '1200px',
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
          About LegalChat Pro
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: theme.textSecondary,
          lineHeight: '1.6',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          LegalChat Pro is a revolutionary platform that connects clients with experienced lawyers 
          through secure, real-time chat consultations. Our mission is to make legal advice 
          accessible, affordable, and convenient for everyone.
        </p>
      </div>
    </div>
  );
};

export default About;
