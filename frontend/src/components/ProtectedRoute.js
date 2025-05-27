import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        background: theme.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          textAlign: 'center',
          background: theme.card,
          padding: '2rem',
          borderRadius: '12px',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
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
          <p style={{ 
            color: theme.text, 
            fontSize: '1rem', 
            fontWeight: '500', 
            margin: 0 
          }}>
            Verifying authentication...
          </p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
