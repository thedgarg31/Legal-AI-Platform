import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const LawyerVerification = () => {
  const { theme } = useTheme();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    personalInfo: {},
    legalCredentials: {},
    documents: {}
  });
  const [loading, setLoading] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData.personalInfo).forEach(key => {
        formDataToSend.append(key, formData.personalInfo[key]);
      });
      
      Object.keys(formData.legalCredentials).forEach(key => {
        formDataToSend.append(key, formData.legalCredentials[key]);
      });
      
      // Add documents
      Object.keys(formData.documents).forEach(key => {
        if (formData.documents[key]) {
          if (Array.isArray(formData.documents[key])) {
            formData.documents[key].forEach(file => {
              formDataToSend.append(key, file);
            });
          } else {
            formDataToSend.append(key, formData.documents[key]);
          }
        }
      });

      const response = await fetch('http://localhost:5000/api/lawyer-verification/submit', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();

      if (result.success) {
        setApplicationId(result.applicationId);
        setStep(5); // Success step
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: theme.text,
            marginBottom: '1rem'
          }}>
            ⚖️ Lawyer Verification
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: theme.textSecondary,
            marginBottom: '2rem'
          }}>
            Complete verification process to join as a verified lawyer
          </p>
          
          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            {[
              'Personal Info',
              'Legal Credentials', 
              'Documents',
              'Review',
              'Verification'
            ].map((stepName, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: step > index + 1 ? '#4CAF50' : step === index + 1 ? theme.accent : theme.border,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  fontWeight: '600'
                }}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span style={{
                  fontSize: '0.9rem',
                  color: step >= index + 1 ? theme.text : theme.textSecondary,
                  fontWeight: step === index + 1 ? '600' : '400'
                }}>
                  {stepName}
                </span>
                {index < 4 && (
                  <div style={{
                    width: '20px',
                    height: '2px',
                    background: step > index + 1 ? '#4CAF50' : theme.border,
                    marginLeft: '0.5rem'
                  }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form Steps */}
        <div style={{
          background: theme.card,
          borderRadius: '16px',
          padding: '2rem',
          border: `1px solid ${theme.border}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {step === 1 && (
            <PersonalInfoStep 
              formData={formData} 
              setFormData={setFormData} 
              onNext={() => setStep(2)}
              theme={theme}
            />
          )}
          
          {step === 2 && (
            <LegalCredentialsStep 
              formData={formData} 
              setFormData={setFormData} 
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              theme={theme}
            />
          )}
          
          {step === 3 && (
            <DocumentsStep 
              formData={formData} 
              setFormData={setFormData} 
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              theme={theme}
            />
          )}
          
          {step === 4 && (
            <ReviewStep 
              formData={formData}
              onSubmit={handleSubmit}
              onBack={() => setStep(3)}
              loading={loading}
              theme={theme}
            />
          )}
          
          {step === 5 && (
            <SuccessStep 
              applicationId={applicationId}
              theme={theme}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Individual step components would be implemented here...
export default LawyerVerification;
