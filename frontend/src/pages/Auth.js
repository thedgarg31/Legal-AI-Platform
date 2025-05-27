import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          console.log('✅ Login successful:', result.user);
          
          // ✅ CHECK FOR STORED REDIRECT PATH
          const redirectPath = localStorage.getItem('redirectAfterLogin');
          if (redirectPath) {
            console.log('🔄 Redirecting to stored path:', redirectPath);
            localStorage.removeItem('redirectAfterLogin');
            navigate(redirectPath, { replace: true });
          } else {
            // Default redirect based on user type
            if (result.user.isLawyer && result.user.lawyerId) {
              console.log('🔄 Redirecting lawyer to dashboard:', result.user.lawyerId);
              navigate(`/lawyer-dashboard/${result.user.lawyerId}`, { replace: true });
            } else {
              console.log('🔄 Redirecting client to:', from);
              navigate(from, { replace: true });
            }
          }
        } else {
          setError(result.message);
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          setLoading(false);
          return;
        }

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          navigate(from, { replace: true });
        } else {
          setError(result.message);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        background: theme.card,
        padding: '2rem',
        borderRadius: '16px',
        border: `1px solid ${theme.border}`,
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: 'white',
            fontSize: '24px'
          }}>
            L
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            color: theme.text,
            margin: '0 0 0.5rem 0'
          }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{
            color: theme.textSecondary,
            margin: 0
          }}>
            {isLogin ? 'Sign in to continue your legal consultations' : 'Join our legal platform'}
          </p>
        </div>

        {/* Demo Credentials Info */}
        {isLogin && (
          <div style={{
            background: '#E3F2FD',
            border: '1px solid #2196F3',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem',
            fontSize: '0.9rem'
          }}>
            <strong style={{ color: '#1976D2' }}>Demo Lawyer Credentials:</strong>
            <br />
            <span style={{ color: '#1976D2' }}>
              lawyer1@legalpro.com / lawyer123 (Dr. Rajesh Kumar)
              <br />
              lawyer2@legalpro.com / lawyer456 (Advocate Priya Sharma)
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.text,
                fontWeight: '500'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  background: theme.primary,
                  color: theme.text,
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>
          )}

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: theme.text,
              fontWeight: '500'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                background: theme.primary,
                color: theme.text,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: theme.text,
              fontWeight: '500'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `1px solid ${theme.border}`,
                borderRadius: '8px',
                background: theme.primary,
                color: theme.text,
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.accent}
              onBlur={(e) => e.target.style.borderColor = theme.border}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.text,
                fontWeight: '500'
              }}>
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  background: theme.primary,
                  color: theme.text,
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = theme.accent}
                onBlur={(e) => e.target.style.borderColor = theme.border}
              />
            </div>
          )}

          {error && (
            <div style={{
              background: `${theme.danger}20`,
              color: theme.danger,
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
              border: `1px solid ${theme.danger}50`
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: theme.accent,
              color: 'white',
              border: 'none',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Toggle */}
        <div style={{
          textAlign: 'center',
          marginTop: '1.5rem',
          paddingTop: '1.5rem',
          borderTop: `1px solid ${theme.border}`
        }}>
          <p style={{ color: theme.textSecondary, margin: '0 0 0.5rem 0' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({ name: '', email: '', password: '', confirmPassword: '' });
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.accent,
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Create Account' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
