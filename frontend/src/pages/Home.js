import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Home = () => {
  const { theme } = useTheme();

  return (
    <div style={{
      background: theme.primary,
      color: theme.text,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif'
    }}>
      {/* Hero Section */}
      <section style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
        padding: '100px 0',
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h1 style={{
            fontSize: '3.5rem',
            fontWeight: '700',
            marginBottom: '1.5rem',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Professional Legal Consultation Platform
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: theme.textSecondary,
            marginBottom: '3rem',
            maxWidth: '600px',
            margin: '0 auto 3rem auto',
            lineHeight: '1.6'
          }}>
            Connect with experienced lawyers instantly. Get professional legal advice through our secure chat platform.
          </p>
          
          <div style={{
            display: 'flex',
            gap: '1.5rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Link
              to="/lawyers"
              style={{
                textDecoration: 'none',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-3px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }}
            >
              Find a Lawyer
            </Link>
            
            <Link
              to="/lawyer-registration"
              style={{
                textDecoration: 'none',
                background: 'transparent',
                color: theme.text,
                padding: '16px 32px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600',
                border: `2px solid ${theme.border}`,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = theme.accent;
                e.target.style.color = 'white';
                e.target.style.borderColor = theme.accent;
                e.target.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = theme.text;
                e.target.style.borderColor = theme.border;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Join as Lawyer
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '80px 0',
        background: theme.secondary
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            textAlign: 'center',
            marginBottom: '3rem',
            color: theme.text
          }}>
            Why Choose LegalChat Pro?
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {[
              {
                icon: '⚡',
                title: 'Instant Connection',
                description: 'Connect with qualified lawyers instantly through our real-time chat platform.'
              },
              {
                icon: '🔒',
                title: 'Secure & Private',
                description: 'All conversations are encrypted and confidential, ensuring your privacy.'
              },
              {
                icon: '💼',
                title: 'Expert Lawyers',
                description: 'Access to verified, experienced lawyers across various legal specializations.'
              },
              {
                icon: '💰',
                title: 'Transparent Pricing',
                description: 'Clear consultation fees with no hidden charges. Pay only for what you use.'
              },
              {
                icon: '📱',
                title: 'Modern Interface',
                description: 'User-friendly platform designed for seamless legal consultations.'
              },
              {
                icon: '⏰',
                title: '24/7 Availability',
                description: 'Get legal help when you need it, with lawyers available around the clock.'
              }
            ].map((feature, index) => (
              <div
                key={index}
                style={{
                  background: theme.card,
                  padding: '2rem',
                  borderRadius: '16px',
                  border: `1px solid ${theme.border}`,
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.cardHover;
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.card;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: theme.text
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: theme.textSecondary,
                  lineHeight: '1.6'
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '80px 0',
        background: theme.primary,
        textAlign: 'center'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '600',
            marginBottom: '1.5rem',
            color: theme.text
          }}>
            Ready to Get Legal Help?
          </h2>
          <p style={{
            fontSize: '1.25rem',
            color: theme.textSecondary,
            marginBottom: '3rem',
            lineHeight: '1.6'
          }}>
            Join thousands of clients who trust LegalChat Pro for their legal consultation needs.
          </p>
          
          <Link
            to="/lawyers"
            style={{
              textDecoration: 'none',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '20px 40px',
              borderRadius: '12px',
              fontSize: '20px',
              fontWeight: '600',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              display: 'inline-block'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
            }}
          >
            Start Your Consultation Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
