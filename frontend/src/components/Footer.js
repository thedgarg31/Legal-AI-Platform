import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
  const { theme } = useTheme();

  return (
    <footer style={{
      background: theme.secondary,
      borderTop: `1px solid ${theme.border}`,
      padding: '2rem 0',
      textAlign: 'center',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem'
      }}>
        <p style={{
          color: theme.textSecondary,
          margin: 0,
          fontSize: '14px'
        }}>
          © 2025 LegalChat Pro. All rights reserved. | Professional Legal Consultation Platform
        </p>
      </div>
    </footer>
  );
};

export default Footer;
