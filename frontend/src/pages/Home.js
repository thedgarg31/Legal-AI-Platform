import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Hero Section - Matching Screenshot */}
      <section style={{
        background: '#f8f9fa',
        padding: '4rem 2rem',
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: '3.5rem',
            color: '#0E0F22',
            marginBottom: '1.5rem',
            fontWeight: 'bold',
            lineHeight: '1.2'
          }}>
            Create Legal Documents & <span style={{
              color: '#666FD0'
            }}>Talk to Lawyers</span> Online
          </h1>
          
          <p style={{
            fontSize: '1.3rem',
            color: '#6c757d',
            marginBottom: '1rem',
            lineHeight: '1.6'
          }}>
            Professional legal forms, contracts, and expert advice at your fingertips.
          </p>
          <p style={{
            fontSize: '1.1rem',
            color: '#6c757d',
            marginBottom: '3rem'
          }}>
            Save time, money, and stress—get started in minutes!
          </p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/document-analysis" style={{
              background: '#666FD0',
              color: 'white',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 4px 15px rgba(102, 111, 208, 0.3)',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              📄 AI Document Analyzer
            </Link>
            <Link to="/chat" style={{
              background: 'transparent',
              color: '#666FD0',
              padding: '1rem 2.5rem',
              fontSize: '1.1rem',
              border: '2px solid #666FD0',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              textDecoration: 'none',
              display: 'inline-block'
            }}>
              💬 Talk to a Lawyer
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - Matching Screenshot */}
      <section style={{
        padding: '4rem 2rem',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '2.5rem',
            color: '#666FD0',
            marginBottom: '3rem',
            fontWeight: 'bold'
          }}>
            How It Works!!!
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#666FD0', 
                fontWeight: 'bold', 
                marginBottom: '1rem' 
              }}>1</div>
              <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Choose Your Legal Form</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Browse 160+ legal contracts & documents.
              </p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#666FD0', 
                fontWeight: 'bold', 
                marginBottom: '1rem' 
              }}>2</div>
              <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Answer Simple Questions</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Our contract creator customizes your form.
              </p>
            </div>
            
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ 
                fontSize: '2rem', 
                color: '#666FD0', 
                fontWeight: 'bold', 
                marginBottom: '1rem' 
              }}>3</div>
              <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Download & Sign</h3>
              <p style={{ color: '#6c757d', lineHeight: '1.6' }}>
                Download, print, or e-sign your legal document.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Legal Experts Section */}
      <section style={{
        padding: '4rem 2rem',
        background: '#f8f9fa',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2.5rem',
            color: '#666FD0',
            marginBottom: '2rem',
            fontWeight: 'bold'
          }}>
            Our Legal Experts
          </h2>
          <p style={{
            fontSize: '1.2rem',
            color: '#6c757d',
            lineHeight: '1.6'
          }}>
            Connect with qualified legal professionals who can provide expert guidance for your specific needs.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
