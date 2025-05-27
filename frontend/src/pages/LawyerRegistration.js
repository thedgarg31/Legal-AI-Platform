import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LawyerRegistration = () => {
  const { theme } = useTheme();
  const { registerLawyer } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    
    // Professional Information
    barRegistrationNumber: '',
    specializations: [],
    experience: '',
    education: '',
    
    // Practice Information
    consultationFees: '',
    availability: 'available',
    practiceAreas: [],
    
    // Address
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const specializations = [
    'Criminal Law', 'Civil Law', 'Corporate Law', 'Family Law', 
    'Property Law', 'Tax Law', 'Labor Law', 'Constitutional Law',
    'Environmental Law', 'Intellectual Property', 'Immigration Law'
  ];

  const practiceAreas = [
    'Litigation', 'Legal Consultation', 'Document Review', 
    'Contract Drafting', 'Legal Research', 'Mediation', 'Arbitration'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e, field) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value)
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.fullName || !formData.email || !formData.password || !formData.phone) {
          setError('Please fill all required fields');
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
          return false;
        }
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
          return false;
        }
        break;
      case 2:
        if (!formData.barRegistrationNumber || !formData.experience || formData.specializations.length === 0) {
          setError('Please fill all required professional information');
          return false;
        }
        break;
      case 3:
        if (!formData.consultationFees || formData.practiceAreas.length === 0) {
          setError('Please fill all required practice information');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(3)) return;
    
    setLoading(true);
    setError('');

    try {
      const lawyerData = {
        personalInfo: {
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode
        },
        credentials: {
          barRegistrationNumber: formData.barRegistrationNumber,
          specializations: formData.specializations,
          experience: parseInt(formData.experience),
          education: formData.education
        },
        availability: {
          isOnline: true,
          consultationFees: parseInt(formData.consultationFees),
          status: formData.availability
        },
        practiceAreas: formData.practiceAreas
      };

      const result = await registerLawyer(lawyerData);
      
      if (result.success) {
        setSuccess(result.message || 'Lawyer account created successfully! You are now logged in.');
        setTimeout(() => {
          navigate('/', { 
            state: { 
              message: 'Welcome to LegalPro! Your lawyer account is now active.' 
            } 
          });
        }, 2000);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text,
              textAlign: 'center'
            }}>
              Personal Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text,
              textAlign: 'center'
            }}>
              Professional Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Bar Registration Number *
                </label>
                <input
                  type="text"
                  name="barRegistrationNumber"
                  value={formData.barRegistrationNumber}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Years of Experience *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  min="0"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Education Background
                </label>
                <textarea
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="e.g., LLB from XYZ University, LLM from ABC College"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '1rem',
                color: theme.text,
                fontWeight: '500'
              }}>
                Specializations * (Select at least one)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem'
              }}>
                {specializations.map(spec => (
                  <label key={spec} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: formData.specializations.includes(spec) ? `${theme.accent}20` : theme.tertiary,
                    border: `1px solid ${formData.specializations.includes(spec) ? theme.accent : theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      value={spec}
                      checked={formData.specializations.includes(spec)}
                      onChange={(e) => handleCheckboxChange(e, 'specializations')}
                      style={{ margin: 0 }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: theme.text
                    }}>
                      {spec}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text,
              textAlign: 'center'
            }}>
              Practice Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Consultation Fees (₹) *
                </label>
                <input
                  type="number"
                  name="consultationFees"
                  value={formData.consultationFees}
                  onChange={handleInputChange}
                  required
                  min="0"
                  placeholder="e.g., 2000"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Availability Status
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    background: theme.primary,
                    color: theme.text,
                    fontSize: '1rem',
                    outline: 'none'
                  }}
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '1rem',
                color: theme.text,
                fontWeight: '500'
              }}>
                Practice Areas * (Select at least one)
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.5rem'
              }}>
                {practiceAreas.map(area => (
                  <label key={area} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px',
                    borderRadius: '6px',
                    background: formData.practiceAreas.includes(area) ? `${theme.accent}20` : theme.tertiary,
                    border: `1px solid ${formData.practiceAreas.includes(area) ? theme.accent : theme.border}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                    <input
                      type="checkbox"
                      value={area}
                      checked={formData.practiceAreas.includes(area)}
                      onChange={(e) => handleCheckboxChange(e, 'practiceAreas')}
                      style={{ margin: 0 }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: theme.text
                    }}>
                      {area}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                marginBottom: '1rem',
                color: theme.text
              }}>
                Address Information
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: theme.text,
                    fontWeight: '500'
                  }}>
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      background: theme.primary,
                      color: theme.text,
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: theme.text,
                    fontWeight: '500'
                  }}>
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      background: theme.primary,
                      color: theme.text,
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: theme.text,
                    fontWeight: '500'
                  }}>
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      background: theme.primary,
                      color: theme.text,
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    color: theme.text,
                    fontWeight: '500'
                  }}>
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: `1px solid ${theme.border}`,
                      borderRadius: '8px',
                      background: theme.primary,
                      color: theme.text,
                      fontSize: '1rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      color: theme.text,
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Join as a Lawyer
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '1.1rem',
            margin: 0
          }}>
            Create your professional lawyer account and start connecting with clients
          </p>
        </div>

        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '2rem'
        }}>
          {[1, 2, 3].map(step => (
            <div key={step} style={{
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: step <= currentStep ? theme.accent : theme.border,
                color: step <= currentStep ? 'white' : theme.textSecondary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                {step}
              </div>
              {step < 3 && (
                <div style={{
                  width: '60px',
                  height: '2px',
                  background: step < currentStep ? theme.accent : theme.border,
                  margin: '0 8px'
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Form */}
        <div style={{
          background: theme.card,
          border: `1px solid ${theme.border}`,
          borderRadius: '12px',
          padding: '2rem'
        }}>
          {/* Messages */}
          {error && (
            <div style={{
              background: `${theme.danger}20`,
              color: theme.danger,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: `1px solid ${theme.danger}50`
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              background: `${theme.success}20`,
              color: theme.success,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: `1px solid ${theme.success}50`
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '2rem',
              gap: '1rem'
            }}>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  style={{
                    background: 'transparent',
                    color: theme.text,
                    border: `1px solid ${theme.border}`,
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Previous
                </button>
              )}

              <div style={{ flex: 1 }} />

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  style={{
                    background: theme.accent,
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: theme.accent,
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 2rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration & Login'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LawyerRegistration;
