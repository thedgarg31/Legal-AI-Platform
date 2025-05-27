import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLawyerById } from '../api/lawyers';

const LawyerProfile = () => {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLawyerProfile();
  }, [id]);

  const fetchLawyerProfile = async () => {
    try {
      setLoading(true);
      const result = await getLawyerById(id);
      if (result.success) {
        setLawyer(result.lawyer);
      }
    } catch (error) {
      console.error('Error fetching lawyer profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
          <p style={{ color: '#6c757d' }}>Loading lawyer profile...</p>
        </div>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div style={{ 
        padding: '2rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: '#ffffff',
        minHeight: '100vh',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#0E0F22' }}>Lawyer not found</h2>
        <Link to="/lawyers" style={{ color: '#666FD0' }}>← Back to Lawyers</Link>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      {/* Back Button */}
      <Link 
        to="/lawyers" 
        style={{ 
          color: '#666FD0', 
          textDecoration: 'none', 
          marginBottom: '2rem', 
          display: 'inline-block' 
        }}
      >
        ← Back to Lawyers
      </Link>

      {/* Lawyer Profile Header */}
      <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{
            width: '120px',
            height: '120px',
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
            fontSize: '3rem',
            fontWeight: 'bold'
          }}>
            {!lawyer.personalInfo.profilePhoto && lawyer.personalInfo.fullName.charAt(0)}
          </div>
          
          <div style={{ flex: 1 }}>
            <h1 style={{ color: '#0E0F22', margin: 0, marginBottom: '0.5rem' }}>
              {lawyer.personalInfo.fullName}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <span style={{
                background: '#4caf50',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                ✓ Verified Lawyer
              </span>
              <span style={{
                background: lawyer.availability.isOnline ? '#4caf50' : '#6c757d',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: 'bold'
              }}>
                {lawyer.availability.isOnline ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
            <p style={{ color: '#6c757d', fontSize: '1.1rem', margin: 0 }}>
              Advocate Code: {lawyer.credentials.advocateCode}
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#666FD0', fontWeight: 'bold', fontSize: '2rem' }}>
              ₹{lawyer.availability.consultationFees}
            </div>
            <div style={{ color: '#6c757d' }}>per consultation</div>
            <Link
              to={`/chat/${lawyer._id}`}
              style={{
                background: '#666FD0',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block',
                marginTop: '1rem'
              }}
            >
              💬 Start Chat
            </Link>
          </div>
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#ffc107', fontSize: '1.5rem' }}>
              {'★'.repeat(Math.floor(lawyer.ratings.averageRating || 4))}
              {'☆'.repeat(5 - Math.floor(lawyer.ratings.averageRating || 4))}
            </span>
            <span style={{ color: '#0E0F22', fontWeight: 'bold' }}>
              {lawyer.ratings.averageRating || 4.0}
            </span>
            <span style={{ color: '#6c757d' }}>
              ({lawyer.ratings.totalReviews || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column */}
        <div>
          {/* Specializations */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Specializations</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {lawyer.credentials.specializations.map((spec, index) => (
                <span key={index} style={{
                  background: 'rgba(102, 111, 208, 0.1)',
                  color: '#666FD0',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}>
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Experience */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Experience & Education</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#666FD0' }}>Experience:</strong>
                <span style={{ color: '#0E0F22', marginLeft: '0.5rem' }}>
                  {lawyer.credentials.experience} years
                </span>
              </div>
              <div>
                <strong style={{ color: '#666FD0' }}>Law Degree:</strong>
                <span style={{ color: '#0E0F22', marginLeft: '0.5rem' }}>
                  {lawyer.credentials.lawDegree.university} ({lawyer.credentials.lawDegree.year})
                </span>
              </div>
              <div>
                <strong style={{ color: '#666FD0' }}>Bar Council:</strong>
                <span style={{ color: '#0E0F22', marginLeft: '0.5rem' }}>
                  {lawyer.credentials.stateBarCouncil}
                </span>
              </div>
              <div>
                <strong style={{ color: '#666FD0' }}>Courts:</strong>
                <span style={{ color: '#0E0F22', marginLeft: '0.5rem' }}>
                  {lawyer.credentials.courtsPracticing.join(', ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Contact Information */}
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
            <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Contact Information</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div>
                <strong style={{ color: '#666FD0' }}>Location:</strong>
                <div style={{ color: '#0E0F22', marginTop: '0.25rem' }}>
                  {lawyer.personalInfo.address.city}, {lawyer.personalInfo.address.state}
                </div>
              </div>
              <div>
                <strong style={{ color: '#666FD0' }}>Languages:</strong>
                <div style={{ color: '#0E0F22', marginTop: '0.25rem' }}>
                  {lawyer.availability.languages?.join(', ') || 'English, Hindi'}
                </div>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ color: '#0E0F22', marginBottom: '1rem' }}>Availability</h3>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: lawyer.availability.isOnline ? 'rgba(76, 175, 80, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                color: lawyer.availability.isOnline ? '#4caf50' : '#6c757d',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                  {lawyer.availability.isOnline ? '🟢' : '⚫'}
                </div>
                <div style={{ fontWeight: 'bold' }}>
                  {lawyer.availability.isOnline ? 'Available Now' : 'Currently Offline'}
                </div>
              </div>
              <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                Consultation Fee: ₹{lawyer.availability.consultationFees}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
