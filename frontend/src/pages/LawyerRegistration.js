import React, { useState } from 'react';
import { registerLawyer } from '../api/lawyers';

const LawyerRegistration = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    advocateCode: '',
    stateBarCouncil: '',
    enrollmentDate: '',
    university: '',
    graduationYear: '',
    specializations: [],
    experience: '',
    courtsPracticing: [],
    consultationFees: '',
    languages: [],
    street: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const [files, setFiles] = useState({
    profilePhoto: null,
    enrollmentCertificate: null,
    degreeProof: null,
    identityProof: null,
    addressProof: null
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const specializations = [
    'Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 
    'Property Law', 'Labour Law', 'Tax Law', 'Constitutional Law',
    'Intellectual Property Law', 'Environmental Law', 'Banking Law', 'Insurance Law'
  ];

  const courts = [
    'Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Magistrate Court'
  ];

  const languages = [
    'English', 'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Gujarati', 'Kannada',
    'Malayalam', 'Punjabi', 'Odia', 'Assamese'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelect = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: prev[name].includes(value) 
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: fileList[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await registerLawyer(formData, files);
      if (result.success) {
        setMessage('Registration submitted successfully! Your application is under review.');
        // Reset form
        setFormData({
          fullName: '', email: '', phone: '', advocateCode: '', stateBarCouncil: '',
          enrollmentDate: '', university: '', graduationYear: '', specializations: [],
          experience: '', courtsPracticing: [], consultationFees: '', languages: [],
          street: '', city: '', state: '', zipCode: ''
        });
        setFiles({
          profilePhoto: null, enrollmentCertificate: null, degreeProof: null,
          identityProof: null, addressProof: null
        });
      }
    } catch (error) {
      setMessage('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '900px', 
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <div className="fade-in-up" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          color: '#0E0F22',
          marginBottom: '1rem',
          fontWeight: 'bold'
        }}>
          Register as a <span style={{ color: '#666FD0' }}>Lawyer</span>
        </h1>
        <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
          Join our platform and connect with clients who need your expertise
        </p>
      </div>

      {message && (
        <div style={{
          background: message.includes('successfully') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
          color: message.includes('successfully') ? '#4caf50' : '#f44336',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          textAlign: 'center',
          border: `1px solid ${message.includes('successfully') ? '#4caf50' : '#f44336'}`
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Personal Information */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ color: '#666FD0', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            📋 Personal Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                placeholder="Enter your full name"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                placeholder="your.email@example.com"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              placeholder="+91 9876543210"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e9ecef', 
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.3s ease'
              }}
            />
          </div>

          <div>
            <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
              Profile Photo
            </label>
            <input
              type="file"
              name="profilePhoto"
              accept="image/*"
              onChange={handleFileChange}
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e9ecef', 
                borderRadius: '8px',
                fontSize: '1rem',
                backgroundColor: '#f8f9fa'
              }}
            />
            <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
              Upload a professional photo (JPG, PNG - Max 5MB)
            </small>
          </div>
        </div>

        {/* Professional Credentials */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ color: '#666FD0', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            ⚖️ Professional Credentials
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Advocate Code *
              </label>
              <input
                type="text"
                name="advocateCode"
                value={formData.advocateCode}
                onChange={handleInputChange}
                placeholder="e.g., DL/2020/12345"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                State Bar Council *
              </label>
              <input
                type="text"
                name="stateBarCouncil"
                value={formData.stateBarCouncil}
                onChange={handleInputChange}
                placeholder="e.g., Bar Council of Delhi"
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Enrollment Date *
              </label>
              <input
                type="date"
                name="enrollmentDate"
                value={formData.enrollmentDate}
                onChange={handleInputChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Experience (years) *
              </label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleInputChange}
                min="0"
                max="50"
                required
                placeholder="5"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                University *
              </label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleInputChange}
                required
                placeholder="Delhi University"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Graduation Year *
              </label>
              <input
                type="number"
                name="graduationYear"
                value={formData.graduationYear}
                onChange={handleInputChange}
                min="1950"
                max="2025"
                required
                placeholder="2018"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Specializations - Improved Layout */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
              Specializations * (Select all that apply)
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '1rem',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '2px solid #e9ecef'
            }}>
              {specializations.map(spec => (
                <label key={spec} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  backgroundColor: formData.specializations.includes(spec) ? 'rgba(102, 111, 208, 0.1)' : 'transparent',
                  border: formData.specializations.includes(spec) ? '1px solid #666FD0' : '1px solid transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.specializations.includes(spec)}
                    onChange={() => handleMultiSelect('specializations', spec)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#666FD0',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ 
                    color: '#0E0F22', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {spec}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Courts Practicing - Improved Layout */}
          <div>
            <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
              Courts Practicing * (Select all that apply)
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
              gap: '1rem',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '2px solid #e9ecef'
            }}>
              {courts.map(court => (
                <label key={court} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  backgroundColor: formData.courtsPracticing.includes(court) ? 'rgba(102, 111, 208, 0.1)' : 'transparent',
                  border: formData.courtsPracticing.includes(court) ? '1px solid #666FD0' : '1px solid transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.courtsPracticing.includes(court)}
                    onChange={() => handleMultiSelect('courtsPracticing', court)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: '#666FD0',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ 
                    color: '#0E0F22', 
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    {court}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Documents Upload */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ color: '#666FD0', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            📁 Required Documents
          </h3>
          
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Enrollment Certificate *
              </label>
              <input
                type="file"
                name="enrollmentCertificate"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Upload your Bar Council enrollment certificate
              </small>
            </div>
            
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Law Degree Certificate *
              </label>
              <input
                type="file"
                name="degreeProof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Upload your LLB/LLM degree certificate
              </small>
            </div>
            
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Identity Proof (Aadhaar/PAN) *
              </label>
              <input
                type="file"
                name="identityProof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Upload Aadhaar card, PAN card, or passport
              </small>
            </div>
            
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Address Proof *
              </label>
              <input
                type="file"
                name="addressProof"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  backgroundColor: '#f8f9fa'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Upload utility bill, bank statement, or rental agreement
              </small>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <h3 style={{ color: '#666FD0', marginBottom: '1.5rem', fontSize: '1.3rem' }}>
            ℹ️ Additional Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                Consultation Fee (₹) *
              </label>
              <input
                type="number"
                name="consultationFees"
                value={formData.consultationFees}
                onChange={handleInputChange}
                min="100"
                max="50000"
                required
                placeholder="2000"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                Per consultation fee in Indian Rupees
              </small>
            </div>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                placeholder="New Delhi"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                State *
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
                placeholder="Delhi"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
            <div>
              <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                placeholder="110001"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e9ecef', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.3s ease'
                }}
              />
            </div>
          </div>

          {/* Languages - Improved Layout */}
          <div>
            <label style={{ color: '#0E0F22', fontWeight: '600', marginBottom: '1rem', display: 'block' }}>
              Languages Spoken (Select all that apply)
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '1rem',
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '12px',
              border: '2px solid #e9ecef'
            }}>
              {languages.map(lang => (
                <label key={lang} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem', 
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '6px',
                  transition: 'all 0.3s ease',
                  backgroundColor: formData.languages.includes(lang) ? 'rgba(102, 111, 208, 0.1)' : 'transparent',
                  border: formData.languages.includes(lang) ? '1px solid #666FD0' : '1px solid transparent'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(lang)}
                    onChange={() => handleMultiSelect('languages', lang)}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#666FD0',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{ 
                    color: '#0E0F22', 
                    fontSize: '0.9rem',
                    fontWeight: '500'
                  }}>
                    {lang}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#e9ecef' : 'linear-gradient(135deg, #666FD0 0%, #4c63d2 100%)',
              color: loading ? '#6c757d' : 'white',
              padding: '1.25rem 4rem',
              fontSize: '1.2rem',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: loading ? 'none' : '0 8px 25px rgba(102, 111, 208, 0.4)',
              transform: loading ? 'none' : 'translateY(0)',
              minWidth: '250px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 12px 35px rgba(102, 111, 208, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 111, 208, 0.4)';
              }
            }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                Submitting...
              </span>
            ) : (
              '📝 Submit Registration'
            )}
          </button>
          
          <p style={{ color: '#6c757d', marginTop: '1rem', fontSize: '0.9rem' }}>
            Your application will be reviewed within 2-3 business days
          </p>
        </div>
      </form>
    </div>
  );
};

export default LawyerRegistration;
