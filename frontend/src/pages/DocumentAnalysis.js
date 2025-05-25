import React, { useState } from 'react';
import { analyzeDocument } from '../api/documents';

const DocumentAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');

  const handleFileUpload = async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }

    setLoading(true);
    setUploadedFileName(file.name);
    
    try {
      const result = await analyzeDocument(file);
      if (result.success) {
        setAnalysis(result.analysis);
        console.log('Analysis completed:', result);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze document. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto',
      background: '#ffffff',
      minHeight: '100vh'
    }}>
      <div className="fade-in-up">
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          <span className="ai-badge" style={{ marginRight: '12px' }}>AI</span>
          Legal Document Analysis
        </h1>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '3rem', fontSize: '1.1rem' }}>
          Upload your legal document and get a comprehensive analysis from our AI lawyer
        </p>
      </div>

      {/* File Upload Area */}
      <div 
        className={`card ${dragActive ? 'drag-active' : ''}`}
        style={{ 
          marginBottom: '2rem',
          border: dragActive ? '2px dashed #666FD0' : '2px dashed #e9ecef',
          background: dragActive ? 'rgba(102, 111, 208, 0.05)' : '#ffffff',
          textAlign: 'center',
          padding: '3rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          borderRadius: '12px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept="application/pdf"
          onChange={handleFileInput}
          style={{ display: 'none' }}
          disabled={loading}
        />
        
        {loading ? (
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
            <h3 className="gradient-text">Analyzing Document...</h3>
            <p style={{ color: '#6c757d' }}>Our AI lawyer is reading your contract...</p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {dragActive ? '📂' : '📄'}
            </div>
            <h3 className="gradient-text">
              {dragActive ? 'Drop PDF Here!' : 'Drop PDF Here or Click to Upload'}
            </h3>
            <p style={{ color: '#6c757d' }}>
              {dragActive ? 'Release to upload your document' : 'Get a professional legal analysis in seconds'}
            </p>
            {uploadedFileName && (
              <p style={{ color: '#666FD0', marginTop: '1rem', fontWeight: 'bold' }}>
                📎 Last uploaded: {uploadedFileName}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Legal Analysis Results */}
      {analysis && (
        <div className="fade-in-up">
          {/* Document Overview */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              📋 Document Overview
            </h3>
            <div style={{ 
              padding: '1.5rem',
              background: 'rgba(102, 111, 208, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(102, 111, 208, 0.2)',
              marginBottom: '1rem'
            }}>
              <h4 style={{ color: '#666FD0', marginBottom: '1rem' }}>📄 {uploadedFileName}</h4>
              <p style={{ color: '#0E0F22', lineHeight: '1.6', margin: 0 }}>
                {analysis.documentSummary.overview}
              </p>
            </div>
          </div>

          {/* What This Document Does */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              🎯 What This Document Does
            </h3>
            <div style={{ 
              padding: '1.5rem',
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <p style={{ color: '#0E0F22', lineHeight: '1.8', fontSize: '1.1rem', margin: 0 }}>
                {analysis.documentSummary.purpose}
              </p>
            </div>
          </div>

          {/* Key Terms Explained */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              🔑 Key Terms Explained (In Simple Language)
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {analysis.documentSummary.keyTerms.map((term, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ color: '#666FD0', marginBottom: '0.5rem' }}>{term.title}</h4>
                  <p style={{ color: '#0E0F22', lineHeight: '1.6', margin: 0 }}>
                    {term.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Potential Risks & Red Flags */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              ⚠️ Potential Risks & Red Flags
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {analysis.documentSummary.risks.map((risk, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: 'rgba(244, 67, 54, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(244, 67, 54, 0.2)',
                  borderLeft: '4px solid #f44336'
                }}>
                  <h4 style={{ color: '#f44336', marginBottom: '0.5rem' }}>🚨 {risk.title}</h4>
                  <p style={{ color: '#0E0F22', lineHeight: '1.6', marginBottom: '1rem' }}>
                    {risk.description}
                  </p>
                  <div style={{ 
                    background: 'rgba(244, 67, 54, 0.1)',
                    padding: '0.8rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>
                    <strong style={{ color: '#f44336' }}>💡 What you should do:</strong>
                    <span style={{ color: '#0E0F22' }}> {risk.recommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Rights & Protections */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              🛡️ Your Rights & Protections
            </h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {analysis.documentSummary.protections.map((protection, index) => (
                <div key={index} style={{
                  padding: '1.5rem',
                  background: 'rgba(76, 175, 80, 0.05)',
                  borderRadius: '8px',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                  borderLeft: '4px solid #4caf50'
                }}>
                  <h4 style={{ color: '#4caf50', marginBottom: '0.5rem' }}>✅ {protection.title}</h4>
                  <p style={{ color: '#0E0F22', lineHeight: '1.6', margin: 0 }}>
                    {protection.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Lawyer's Recommendations */}
          <div className="card" style={{ 
            marginBottom: '2rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              👨‍💼 AI Lawyer's Recommendations
            </h3>
            <div style={{
              padding: '2rem',
              background: 'rgba(102, 111, 208, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(102, 111, 208, 0.2)'
            }}>
              <h4 style={{ color: '#666FD0', marginBottom: '1rem' }}>📝 Before You Sign:</h4>
              <ul style={{ color: '#0E0F22', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
                {analysis.documentSummary.recommendations.map((rec, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="card" style={{ 
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 className="gradient-text" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
              🎯 Overall Assessment
            </h3>
            <div style={{
              padding: '2rem',
              background: analysis.documentSummary.overallRisk === 'HIGH' ? 'rgba(244, 67, 54, 0.05)' : 
                          analysis.documentSummary.overallRisk === 'MEDIUM' ? 'rgba(255, 152, 0, 0.05)' : 
                          'rgba(76, 175, 80, 0.05)',
              borderRadius: '8px',
              border: `1px solid ${analysis.documentSummary.overallRisk === 'HIGH' ? 'rgba(244, 67, 54, 0.2)' : 
                                   analysis.documentSummary.overallRisk === 'MEDIUM' ? 'rgba(255, 152, 0, 0.2)' : 
                                   'rgba(76, 175, 80, 0.2)'}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {analysis.documentSummary.overallRisk === 'HIGH' ? '🚨' : 
                 analysis.documentSummary.overallRisk === 'MEDIUM' ? '⚠️' : '✅'}
              </div>
              <h4 style={{ 
                color: analysis.documentSummary.overallRisk === 'HIGH' ? '#f44336' : 
                       analysis.documentSummary.overallRisk === 'MEDIUM' ? '#ff9800' : '#4caf50',
                marginBottom: '1rem',
                fontSize: '1.5rem'
              }}>
                {analysis.documentSummary.overallRisk} RISK LEVEL
              </h4>
              <p style={{ color: '#0E0F22', lineHeight: '1.8', fontSize: '1.1rem', margin: 0 }}>
                {analysis.documentSummary.finalAdvice}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentAnalysis;
