import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import DocumentUpload from '../components/DocumentUpload';
import DocumentAnalysis from '../components/DocumentAnalysis';

const DocumentAnalysisPage = () => {
  const { theme } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [showUpload, setShowUpload] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const handleDocumentUpload = (document) => {
    console.log('📄 Document uploaded:', document);
    setDocuments(prev => [document, ...prev]);
    setSelectedDocument(document);
    setShowUpload(false);
    
    // Add welcome message from AI
    const welcomeMessage = {
      id: Date.now(),
      type: 'ai',
      message: `Hello! I've analyzed your document "${document.originalName}". I found it's a ${document.analysis.documentType} with ${document.analysis.riskLevel} risk level. Feel free to ask me any questions about your document!`,
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  };

  const sendMessageToAI = async () => {
    if (!currentMessage.trim() || !selectedDocument) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      message: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsAiTyping(true);

    try {
      // Send message to AI backend
      const response = await fetch('http://localhost:5000/api/documents/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: currentMessage,
          documentId: selectedDocument.id,
          documentAnalysis: selectedDocument.analysis,
          documentText: selectedDocument.extractedText || ''
        })
      });

      const result = await response.json();

      if (result.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          message: result.response,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(result.message || 'AI response failed');
      }
    } catch (error) {
      console.error('❌ AI chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        message: 'Sorry, I encountered an error. Please try asking your question again.',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const getSuggestedQuestions = () => {
    if (!selectedDocument) return [];
    
    const docType = selectedDocument.analysis.documentType;
    const riskLevel = selectedDocument.analysis.riskLevel;
    
    const suggestions = {
      'contract': [
        'What are the key obligations for each party?',
        'What happens if someone breaches this contract?',
        'Can this contract be terminated early?',
        'What are the payment terms?'
      ],
      'lease': [
        'What are my rights as a tenant?',
        'What maintenance responsibilities do I have?',
        'Can the rent be increased during the lease term?',
        'What happens if I need to move out early?'
      ],
      'employment': [
        'What benefits am I entitled to?',
        'What are the termination conditions?',
        'Are there any non-compete clauses?',
        'What is the notice period required?'
      ],
      'general': [
        'What are the main legal risks in this document?',
        'What should I be most careful about?',
        'Are there any missing clauses I should consider?',
        'What would a lawyer recommend?'
      ]
    };

    return suggestions[docType] || suggestions['general'];
  };

  return (
    <div style={{
      background: theme.primary,
      minHeight: '100vh',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      color: theme.text
    }}>
      {/* Main Content - NO HERO SECTION */}
      <section style={{
        padding: '2rem 0',
        background: theme.primary,
        minHeight: '100vh'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 2rem'
        }}>
          {/* Simple title at the top */}
          <div style={{
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: theme.text,
              margin: '0 0 0.5rem 0'
            }}>
              🤖 AI Legal Document Assistant
            </h1>
            <p style={{
              color: theme.textSecondary,
              fontSize: '1rem',
              margin: 0
            }}>
              Upload your legal documents and chat with our AI assistant
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: documents.length > 0 ? '1fr 1fr' : '1fr',
            gap: '2rem',
            alignItems: 'start'
          }}>
            {/* Left Column - Upload & Analysis */}
            <div>
              {/* Upload Section */}
              {showUpload && (
                <div style={{
                  background: theme.card,
                  borderRadius: '16px',
                  padding: '2rem',
                  marginBottom: '2rem',
                  border: `1px solid ${theme.border}`
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: theme.text,
                    textAlign: 'center'
                  }}>
                    Upload Your Legal Document
                  </h2>
                  <p style={{
                    color: theme.textSecondary,
                    textAlign: 'center',
                    marginBottom: '2rem'
                  }}>
                    Supported formats: PDF files up to 10MB
                  </p>
                  
                  <DocumentUpload onUploadSuccess={handleDocumentUpload} />
                </div>
              )}

              {/* Analysis Results */}
              {documents.length > 0 && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                  }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: '600',
                      color: theme.text,
                      margin: 0
                    }}>
                      📄 Analysis Results
                    </h2>
                    
                    <button
                      onClick={() => setShowUpload(true)}
                      style={{
                        background: theme.accent,
                        color: 'white',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: '600',
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
                      📤 Upload Another
                    </button>
                  </div>

                  {documents.map((doc, index) => (
                    <div key={doc.id || index} style={{ marginBottom: '2rem' }}>
                      <DocumentAnalysis document={doc} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - AI Chat */}
            {selectedDocument && (
              <div style={{
                background: theme.card,
                borderRadius: '16px',
                border: `1px solid ${theme.border}`,
                height: '600px',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Chat Header */}
                <div style={{
                  padding: '1.5rem',
                  borderBottom: `1px solid ${theme.border}`,
                  background: theme.accent,
                  borderRadius: '16px 16px 0 0',
                  color: 'white'
                }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>
                    🤖 AI Legal Assistant
                  </h3>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', opacity: 0.9 }}>
                    Ask questions about "{selectedDocument.originalName}"
                  </p>
                </div>

                {/* Chat Messages */}
                <div style={{
                  flex: 1,
                  overflow: 'auto',
                  padding: '1rem'
                }}>
                  {chatMessages.map((msg) => (
                    <div key={msg.id} style={{
                      marginBottom: '1rem',
                      display: 'flex',
                      justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        maxWidth: '80%',
                        padding: '0.75rem 1rem',
                        borderRadius: msg.type === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: msg.type === 'user' ? theme.accent : theme.tertiary,
                        color: msg.type === 'user' ? 'white' : theme.text
                      }}>
                        <div style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {msg.message}
                        </div>
                        <div style={{
                          fontSize: '0.7rem',
                          opacity: 0.7,
                          marginTop: '0.25rem',
                          textAlign: 'right'
                        }}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isAiTyping && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '18px 18px 18px 4px',
                        background: theme.tertiary,
                        color: theme.text
                      }}>
                        <div style={{ fontSize: '0.9rem' }}>🤖 AI is thinking...</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Questions */}
                {chatMessages.length === 1 && (
                  <div style={{
                    padding: '1rem',
                    borderTop: `1px solid ${theme.border}`,
                    background: theme.secondary
                  }}>
                    <p style={{
                      fontSize: '0.8rem',
                      color: theme.textSecondary,
                      margin: '0 0 0.5rem 0',
                      fontWeight: '600'
                    }}>
                      💡 Suggested questions:
                    </p>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {getSuggestedQuestions().slice(0, 3).map((question, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMessage(question)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${theme.border}`,
                            borderRadius: '12px',
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.7rem',
                            color: theme.textSecondary,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = theme.accent;
                            e.target.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'transparent';
                            e.target.style.color = theme.textSecondary;
                          }}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat Input */}
                <div style={{
                  padding: '1rem',
                  borderTop: `1px solid ${theme.border}`
                }}>
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    alignItems: 'flex-end'
                  }}>
                    <textarea
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessageToAI();
                        }
                      }}
                      placeholder="Ask me anything about your document..."
                      rows={2}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: `1px solid ${theme.border}`,
                        borderRadius: '12px',
                        fontSize: '0.9rem',
                        fontFamily: 'inherit',
                        background: theme.primary,
                        color: theme.text,
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    <button
                      onClick={sendMessageToAI}
                      disabled={!currentMessage.trim() || isAiTyping}
                      style={{
                        background: currentMessage.trim() && !isAiTyping ? theme.accent : theme.tertiary,
                        color: currentMessage.trim() && !isAiTyping ? 'white' : theme.textSecondary,
                        border: 'none',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        cursor: currentMessage.trim() && !isAiTyping ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      ➤
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentAnalysisPage;
