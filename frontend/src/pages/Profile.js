import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Profile = () => {
  const { user, token } = useAuth();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    },
    bio: '',
    occupation: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    profilePhoto: null
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const profile = data.user.profile || {};
        setProfileData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
          gender: profile.gender || '',
          address: profile.address || {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
          },
          bio: profile.bio || '',
          occupation: profile.occupation || '',
          emergencyContact: profile.emergencyContact || {
            name: '',
            phone: '',
            relationship: ''
          },
          profilePhoto: profile.profilePhoto || null
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, PNG, and GIF images are allowed');
      return;
    }

    setUploadingPhoto(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const response = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: data.profilePhoto
        }));
        setMessage('Profile photo updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setError('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!profileData.profilePhoto) return;

    try {
      const response = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfileData(prev => ({
          ...prev,
          profilePhoto: null
        }));
        setMessage('Profile photo deleted successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError(data.message || 'Failed to delete photo');
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo');
    }
  };

  if (loading) {
    return (
      <div style={{
        background: theme.primary,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
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
            fontWeight: '600',
            margin: '0 0 0.5rem 0',
            color: theme.text
          }}>
            👤 My Profile
          </h1>
          <p style={{
            color: theme.textSecondary,
            fontSize: '1.1rem',
            margin: 0
          }}>
            Complete your profile to enhance your experience
          </p>
        </div>

        {/* Messages */}
        {message && (
          <div style={{
            background: `${theme.success}20`,
            color: theme.success,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${theme.success}50`
          }}>
            {message}
          </div>
        )}

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

        <form onSubmit={handleSubmit}>
          {/* Profile Photo Section */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text
            }}>
              📸 Profile Photo
            </h2>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              {/* Photo Display */}
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: profileData.profilePhoto 
                  ? `url(http://localhost:5000/uploads/profiles/${profileData.profilePhoto})` 
                  : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '2rem',
                fontWeight: 'bold',
                border: `3px solid ${theme.border}`,
                position: 'relative'
              }}>
                {!profileData.profilePhoto && (user?.name?.charAt(0) || '👤')}
              </div>

              {/* Photo Actions */}
              <div style={{ flex: 1 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  style={{ display: 'none' }}
                />
                
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    style={{
                      background: theme.accent,
                      color: 'white',
                      border: 'none',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                      opacity: uploadingPhoto ? 0.7 : 1
                    }}
                  >
                    {uploadingPhoto ? 'Uploading...' : (profileData.profilePhoto ? 'Change Photo' : 'Upload Photo')}
                  </button>

                  {profileData.profilePhoto && (
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      style={{
                        background: theme.danger,
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      Delete Photo
                    </button>
                  )}
                </div>

                <p style={{
                  color: theme.textSecondary,
                  fontSize: '0.8rem',
                  margin: '0.5rem 0 0 0'
                }}>
                  Max file size: 5MB. Supported formats: JPEG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text
            }}>
              📝 Basic Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
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
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
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
                  value={profileData.phone}
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
                  value={profileData.dateOfBirth}
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
                  Gender
                </label>
                <select
                  name="gender"
                  value={profileData.gender}
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
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={profileData.occupation}
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

            <div style={{ marginTop: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.text,
                fontWeight: '500'
              }}>
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                rows={3}
                maxLength={500}
                placeholder="Tell us about yourself..."
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
              <div style={{
                textAlign: 'right',
                fontSize: '0.8rem',
                color: theme.textSecondary,
                marginTop: '0.25rem'
              }}>
                {profileData.bio.length}/500
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text
            }}>
              🏠 Address Information
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={profileData.address.street}
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
                  name="address.city"
                  value={profileData.address.city}
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
                  name="address.state"
                  value={profileData.address.state}
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
                  name="address.zipCode"
                  value={profileData.address.zipCode}
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
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={profileData.address.country}
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

          {/* Emergency Contact */}
          <div style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.3rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: theme.text
            }}>
              🚨 Emergency Contact
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: theme.text,
                  fontWeight: '500'
                }}>
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContact.name"
                  value={profileData.emergencyContact.name}
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
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContact.phone"
                  value={profileData.emergencyContact.phone}
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
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContact.relationship"
                  value={profileData.emergencyContact.relationship}
                  onChange={handleInputChange}
                  placeholder="e.g., Spouse, Parent, Sibling"
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

          {/* Submit Button */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                background: theme.accent,
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1,
                minWidth: '150px'
              }}
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
