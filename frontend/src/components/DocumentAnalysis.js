import React from 'react';
import { useTheme } from '../context/ThemeContext';

const DocumentAnalysis = ({ document }) => {
  const { theme } = useTheme();

  if (!document || !document.analysis) {
    return null;
  }

  const { analysis } = document;

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return theme.success;
      case 'Medium': return theme.warning;
      case 'High': return theme.danger;
      default: return theme.textSecondary;
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return theme.success;
    if (confidence >= 60) return theme.warning;
    return theme.danger;
  };

  return (
    <div style={{
      background: theme.card,
      border: `1px solid ${theme.border}`,
      borderRadius: '12px',
      padding: '1.5rem',
      marginTop: '1rem'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: `1px solid ${theme.border}`
      }}>
        <div>
          <h3 style={{
            color: theme.text,
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            📄 Document Analysis
          </h3>
          <p style={{
            color: theme.textSecondary,
            margin: '0.25rem 0 0 0',
            fontSize: '0.9rem'
          }}>
            {document.originalName}
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          alignItems: 'center'
        }}>
          <div style={{
            background: `${getRiskColor(analysis.riskLevel)}20`,
            color: getRiskColor(analysis.riskLevel),
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            border: `1px solid ${getRiskColor(analysis.riskLevel)}50`
          }}>
            Risk: {analysis.riskLevel}
          </div>
          
          <div style={{
            background: `${getConfidenceColor(analysis.confidence)}20`,
            color: getConfidenceColor(analysis.confidence),
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.8rem',
            fontWeight: '600',
            border: `1px solid ${getConfidenceColor(analysis.confidence)}50`
          }}>
            {analysis.confidence}% Confidence
          </div>
        </div>
      </div>

      {/* Document Type */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          color: theme.text,
          margin: '0 0 0.5rem 0',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          📋 Document Type
        </h4>
        <div style={{
          background: `${theme.accent}15`,
          color: theme.accent,
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          textTransform: 'capitalize'
        }}>
          {analysis.documentType}
        </div>
      </div>

      {/* Summary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h4 style={{
          color: theme.text,
          margin: '0 0 0.5rem 0',
          fontSize: '1rem',
          fontWeight: '600'
        }}>
          📝 Summary
        </h4>
        <p style={{
          color: theme.textSecondary,
          margin: 0,
          lineHeight: '1.5',
          fontSize: '0.95rem'
        }}>
          {analysis.summary}
        </p>
      </div>

      {/* Key Points */}
      {analysis.keyPoints && analysis.keyPoints.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{
            color: theme.text,
            margin: '0 0 0.75rem 0',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            🔍 Key Points
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: theme.textSecondary
          }}>
            {analysis.keyPoints.map((point, index) => (
              <li key={index} style={{
                marginBottom: '0.5rem',
                lineHeight: '1.4',
                fontSize: '0.9rem'
              }}>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Legal Issues */}
      {analysis.legalIssues && analysis.legalIssues.length > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{
            color: theme.text,
            margin: '0 0 0.75rem 0',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            ⚠️ Legal Issues to Consider
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: theme.textSecondary
          }}>
            {analysis.legalIssues.map((issue, index) => (
              <li key={index} style={{
                marginBottom: '0.5rem',
                lineHeight: '1.4',
                fontSize: '0.9rem'
              }}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div>
          <h4 style={{
            color: theme.text,
            margin: '0 0 0.75rem 0',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            💡 Recommendations
          </h4>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: theme.textSecondary
          }}>
            {analysis.recommendations.map((rec, index) => (
              <li key={index} style={{
                marginBottom: '0.5rem',
                lineHeight: '1.4',
                fontSize: '0.9rem'
              }}>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: '1.5rem',
        paddingTop: '1rem',
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          fontSize: '0.8rem',
          color: theme.textSecondary
        }}>
          Analyzed on {new Date(document.analysisDate).toLocaleDateString()}
        </div>
        
        <button
          onClick={() => {
            window.open(`http://localhost:5000/api/documents/download/${document.id}`, '_blank');
          }}
          style={{
            background: theme.accent,
            color: 'white',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = theme.accentHover;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = theme.accent;
          }}
        >
          📥 Download PDF
        </button>
      </div>
    </div>
  );
};

export default DocumentAnalysis;
