import React from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const ProtectedLawyerRoute = ({ children }) => {
  const { isAuthenticated, user, loading, login } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const { lawyerId } = useParams();
  const [autoLoggingIn, setAutoLoggingIn] = React.useState(false);

  // Auto-login demo lawyers for demo purposes
  React.useEffect(() => {
    const autoLoginDemoLawyer = async () => {
      if (!loading && !isAuthenticated && !autoLoggingIn) {
        // Demo lawyer credentials for auto-login
        const demoLawyerCredentials = {
          '68343b007976480a55bce7f5': { email: 'rajesh@demo.com', password: 'demo123' },
          '68343b007976480a55bce7f6': { email: 'priya@demo.com', password: 'demo123' },
          '68343b007976480a55bce7f7': { email: 'vikram@demo.com', password: 'demo123' }
        };

        const demoCredentials = demoLawyerCredentials[lawyerId];
        if (demoCredentials) {
          setAutoLoggingIn(true);
          console.log('🔄 Auto-logging in demo lawyer:', lawyerId);
          try {
            const result = await login(demoCredentials.email, demoCredentials.password);
            if (result.success) {
              console.log('✅ Demo lawyer auto-login successful');
            } else {
              console.error('❌ Demo lawyer auto-login failed:', result.message);
            }
          } catch (error) {
            console.error('❌ Auto-login error:', error);
          } finally {
            setAutoLoggingIn(false);
          }
        }
      }
    };

    autoLoginDemoLawyer();
  }, [loading, isAuthenticated, lawyerId, login, autoLoggingIn]);

  if (loading || autoLoggingIn) {
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
            {autoLoggingIn ? 'Logging in demo lawyer...' : 'Verifying authentication...'}
          </p>
          {autoLoggingIn && (
            <p style={{ 
              color: theme.textSecondary, 
              fontSize: '0.9rem', 
              margin: '0.5rem 0 0 0' 
            }}>
              Please wait while we authenticate your lawyer account
            </p>
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
  }

  // Not authenticated and not a demo lawyer - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ 
      from: location,
      message: 'Please log in to access the lawyer dashboard' 
    }} replace />;
  }

  // Authenticated but not a lawyer - redirect to home
  if (!user.isLawyer) {
    return <Navigate to="/" state={{ 
      message: 'Access denied. Lawyer account required.' 
    }} replace />;
  }

  // Authenticated lawyer but accessing wrong dashboard - redirect to their dashboard
  if (user.lawyerId && user.lawyerId !== lawyerId) {
    return <Navigate to={`/lawyer-dashboard/${user.lawyerId}`} replace />;
  }

  // All checks passed - render the protected component
  return children;
};

export default ProtectedLawyerRoute;
