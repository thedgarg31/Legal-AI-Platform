import React from 'react';
import { useTheme } from '../context/ThemeContext';

const Services = () => {
  const { theme } = useTheme();

  const services = [
    {
      title: 'Legal Consultation',
      description: 'Get expert legal advice from qualified lawyers',
      icon: '⚖️'
    },
    {
      title: 'Document Review',
      description: 'Professional review of your legal documents',
      icon: '📄'
    },
    {
      title: 'Contract Analysis',
      description: 'Comprehensive analysis of contracts and agreements',
      icon: '📋'
    },
    {
      title: 'Legal Research',
      description: 'In-depth legal research for your case',
      icon: '🔍'
    }
  ];

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
        margin: '0 auto'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: '700',
          marginBottom: '3rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Our Services
        </h1>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }}>
          {services.map((service, index) => (
            <div
              key={index}
              style={{
                background: theme.card,
                padding: '2rem',
                borderRadius: '16px',
                border: `1px solid ${theme.border}`,
                textAlign: 'center',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {service.icon}
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: theme.text
              }}>
                {service.title}
              </h3>
              <p style={{
                color: theme.textSecondary,
                lineHeight: '1.6'
              }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
