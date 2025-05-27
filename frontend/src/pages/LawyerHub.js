import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllLawyers } from '../api/lawyers';

const LawyerHub = () => {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    specialization: '',
    city: '',
    minExperience: '',
    maxFees: ''
  });

  useEffect(() => {
    fetchLawyers();
  }, [filters]);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const result = await getAllLawyers(filters);
      if (result.success) {
        setLawyers(result.lawyers);
      }
    } catch (error) {
      console.error('Error fetching lawyers:', error);
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    'Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 
    'Property Law', 'Labour Law', 'Tax Law', 'Constitutional Law'
  ];

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1400px', 
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Header */}
      <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#0E0F22',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          Find <span style={{ color: '#666FD0' }}>Verified Lawyers</span>
        </h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          Connect with qualified legal professionals across India
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ color: '#0E0F22', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
              Specialization
            </label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({...filters, specialization: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                color: '#0E0F22'
              }}
            >
              <option value="">All Specializations</option>
              {specializations.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ color: '#0E0F22', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
              City
            </label>
            <input
              type="text"
              placeholder="Enter city name"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                color: '#0E0F22'
              }}
            />
          </div>

          <div>
            <label style={{ color: '#0E0F22', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
              Min Experience (years)
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minExperience}
              onChange={(e) => setFilters({...filters, minExperience: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                color: '#0E0F22'
              }}
            />
          </div>

          <div>
            <label style={{ color: '#0E0F22', fontWeight: '500', marginBottom: '0.5rem', display: 'block' }}>
              Max Consultation Fee (₹)
            </label>
            <input
              type="number"
              placeholder="5000"
              value={filters.maxFees}
              onChange={(e) => setFilters({...filters, maxFees: e.target.value})}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                color: '#0E0F22'
              }}
            />
          </div>

          <button
            onClick={() => setFilters({ specialization: '', city: '', minExperience: '', maxFees: '' })}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#666FD0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Lawyer Registration CTA */}
      <div className="card" style={{ 
        marginBottom: '2rem', 
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(102, 111, 208, 0.1) 0%, rgba(102, 111, 208, 0.05) 100%)',
        border: '1px solid rgba(102, 111, 208, 0.2)',
        textAlign: 'center'
      }}>
        <h3 style={{ color: '#666FD0', marginBottom: '1rem' }}>Are you a lawyer?</h3>
        <p style={{ color: '#6c757d', marginBottom: '1.5rem' }}>
          Join our platform and connect with clients who need your expertise
        </p>
        <Link 
          to="/lawyer/register"
          style={{
            background: '#666FD0',
            color: 'white',
            padding: '0.75rem 2rem',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 'bold',
            display: 'inline-block'
          }}
        >
          Register as Lawyer
        </Link>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#6c757d' }}>Finding lawyers for you...</p>
        </div>
      )}

      {/* Lawyers Grid */}
      {!loading && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          {lawyers.map(lawyer => (
            <div key={lawyer._id} className="card" style={{
              padding: '1.5rem',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}>
              {/* Lawyer Header */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: lawyer.personalInfo.profilePhoto 
                    ? `url(http://localhost:5000/uploads/lawyer-documents/${lawyer.personalInfo.profilePhoto})` 
                    : 'linear-gradient(135deg, #666FD0 0%, #4c63d2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  marginRight: '1rem'
                }}>
                  {!lawyer.personalInfo.profilePhoto && lawyer.personalInfo.fullName.charAt(0)}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: '#0E0F22', margin: 0, marginBottom: '0.25rem' }}>
                    {lawyer.personalInfo.fullName}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      background: '#4caf50',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      ✓ Verified
                    </span>
                    <span style={{
                      background: lawyer.availability.isOnline ? '#4caf50' : '#6c757d',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {lawyer.availability.isOnline ? '🟢 Online' : '⚫ Offline'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Specializations */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {lawyer.credentials.specializations.slice(0, 3).map((spec, index) => (
                    <span key={index} style={{
                      background: 'rgba(102, 111, 208, 0.1)',
                      color: '#666FD0',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem',
                      fontWeight: '500'
                    }}>
                      {spec}
                    </span>
                  ))}
                  {lawyer.credentials.specializations.length > 3 && (
                    <span style={{
                      background: '#f8f9fa',
                      color: '#6c757d',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '15px',
                      fontSize: '0.8rem'
                    }}>
                      +{lawyer.credentials.specializations.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Experience and Location */}
              <div style={{ marginBottom: '1rem' }}>
                <p style={{ color: '#6c757d', margin: 0, marginBottom: '0.25rem' }}>
                  📍 {lawyer.personalInfo.address.city}, {lawyer.personalInfo.address.state}
                </p>
                <p style={{ color: '#6c757d', margin: 0, marginBottom: '0.25rem' }}>
                  ⚖️ {lawyer.credentials.experience} years experience
                </p>
                <p style={{ color: '#6c757d', margin: 0 }}>
                  🏛️ {lawyer.credentials.courtsPracticing.join(', ')}
                </p>
              </div>

              {/* Rating and Fees */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#ffc107' }}>
                      {'★'.repeat(Math.floor(lawyer.ratings.averageRating || 4))}
                      {'☆'.repeat(5 - Math.floor(lawyer.ratings.averageRating || 4))}
                    </span>
                    <span style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                      ({lawyer.ratings.totalReviews || 0} reviews)
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#666FD0', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    ₹{lawyer.availability.consultationFees}
                  </div>
                  <div style={{ color: '#6c757d', fontSize: '0.8rem' }}>
                    per consultation
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link
                  to={`/lawyers/${lawyer._id}`}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    color: '#666FD0',
                    border: '2px solid #666FD0',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  View Profile
                </Link>
                <Link
                  to={`/chat/${lawyer._id}`}
                  style={{
                    flex: 1,
                    background: '#666FD0',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease'
                  }}
                >
                  💬 Start Chat
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Lawyers Found */}
      {!loading && lawyers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>No lawyers found</h3>
          <p style={{ color: '#6c757d' }}>
            Try adjusting your filters or check back later for more lawyers.
          </p>
        </div>
      )}
    </div>
  );
};

export default LawyerHub;
