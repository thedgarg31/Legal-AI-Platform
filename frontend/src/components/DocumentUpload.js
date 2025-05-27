import React, { useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

const DocumentUpload = ({ onUploadSuccess }) => {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

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
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') {
      alert('Please upload only PDF files');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('document', file);

      console.log('📤 Uploading file:', file.name);

      const response = await fetch('http://localhost:5000/api/documents/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Upload successful:', result.document);
        if (onUploadSuccess) {
          onUploadSuccess(result.document);
        }
      } else {
        console.error('❌ Upload failed:', result.message);
        alert('Upload failed: ' + result.message);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      border: `2px dashed ${dragActive ? theme.accent : theme.border}`,
      borderRadius: '12px',
      padding: '2rem',
      textAlign: 'center',
      background: dragActive ? `${theme.accent}10` : theme.secondary,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}
    onDragEnter={handleDrag}
    onDragLeave={handleDrag}
    onDragOver={handleDrag}
    onDrop={handleDrop}
    onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      
      {uploading ? (
        <div>
          <div style={{
            width: '40px',
            height: '40px',
            border: `4px solid ${theme.border}`,
            borderTop: `4px solid ${theme.accent}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem auto'
          }}></div>
          <p style={{ color: theme.text, margin: 0 }}>
            Analyzing document...
          </p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ color: theme.text, marginBottom: '0.5rem' }}>
            Upload PDF Document
          </h3>
          <p style={{ color: theme.textSecondary, marginBottom: '1rem' }}>
            Drag and drop your PDF here, or click to select
          </p>
          <p style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
            Maximum file size: 10MB
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default DocumentUpload;
