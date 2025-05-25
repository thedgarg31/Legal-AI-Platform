import React, { useState, useRef, useEffect } from 'react';
import { uploadDocumentForChat, chatWithDocument } from './api/chat';

const ChatWithPDF = () => {
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Drag and drop handlers
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
    
    console.log('=== FILE DROPPED ===');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      console.log('Dropped file:', droppedFile.name);
      setFile(droppedFile);
      handleFileUpload(droppedFile);
    }
  };

  // File input change handler
  const handleFileChange = (event) => {
    console.log('=== FILE SELECTED ===');
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      console.log('Selected file:', selectedFile.name);
      setFile(selectedFile);
      handleFileUpload(selectedFile);
    }
  };

  const handleFileUpload = async (fileToUpload) => {
    console.log('=== FILE UPLOAD START ===');
    console.log('File to upload:', fileToUpload);

    if (!fileToUpload || fileToUpload.type !== 'application/pdf') {
      console.log('❌ File validation failed');
      alert('Please upload a PDF file only.');
      return;
    }

    console.log('✅ File validation passed');
    setIsUploading(true);
    
    try {
      console.log('📤 Calling API...');
      const result = await uploadDocumentForChat(fileToUpload);
      console.log('📥 API Response:', result);
      
      if (result.success) {
        console.log('✅ Upload successful');
        setSessionId(result.sessionId);
        setUploadedFileName(result.filename);
        setChatHistory([{
          role: 'assistant',
          content: `Great! I've analyzed your document "${result.filename}". You can now ask me any questions about its content. For example: "What are my main obligations?" or "What are the termination conditions?"`
        }]);
      } else {
        console.log('❌ Upload failed - API returned success: false');
        alert('Upload failed: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Upload Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response?.data);
      alert('Failed to upload document: ' + error.message);
    } finally {
      setIsUploading(false);
      console.log('=== FILE UPLOAD END ===');
    }
  };

  const handleSendMessage = async () => {
    if (!currentQuestion.trim() || !sessionId || isLoading) return;

    const question = currentQuestion.trim();
    setCurrentQuestion('');
    setIsLoading(true);

    const newChatHistory = [...chatHistory, { role: 'user', content: question }];
    setChatHistory(newChatHistory);

    try {
      const result = await chatWithDocument(sessionId, question, chatHistory);
      
      if (result.success) {
        setChatHistory([...newChatHistory, { 
          role: 'assistant', 
          content: result.answer 
        }]);
      } else {
        setChatHistory([...newChatHistory, { 
          role: 'assistant', 
          content: 'I apologize, but I encountered an error. Please try asking your question again.' 
        }]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory([...newChatHistory, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try asking your question again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '1200px', 
      margin: '0 auto', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#ffffff'
    }}>
      <div className="fade-in-up">
        <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>
          <span className="ai-badge" style={{ marginRight: '12px' }}>AI</span>
          Chat with Your PDF
        </h1>
        <p style={{ textAlign: 'center', color: '#6c757d', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Upload a legal document and ask questions about it - get instant, intelligent answers
        </p>
      </div>

      {!sessionId ? (
        /* File Upload Area with Drag & Drop */
        <div 
          className={`card ${dragActive ? 'drag-active' : ''}`}
          style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            marginBottom: '2rem',
            border: dragActive ? '2px dashed #666FD0' : '2px dashed #e9ecef',
            background: dragActive ? 'rgba(102, 111, 208, 0.05)' : '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
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
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div>
              <div className="loading-spinner" style={{ margin: '0 auto 1rem auto' }}></div>
              <h3 className="gradient-text">Preparing Document for Chat...</h3>
              <p style={{ color: '#6c757d' }}>AI is analyzing your PDF...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                {dragActive ? '📂' : '📄'}
              </div>
              <h3 className="gradient-text">
                {dragActive ? 'Drop PDF Here!' : 'Upload PDF to Start Chatting'}
              </h3>
              <p style={{ color: '#6c757d' }}>
                {dragActive ? 'Release to upload your document' : 'Click here or drag & drop your legal document'}
              </p>
              {file && !dragActive && (
                <p style={{ color: '#666FD0', marginTop: '1rem', fontWeight: 'bold' }}>
                  📎 Selected: {file.name}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Chat Interface */
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Document Info */}
          <div className="card" style={{ 
            marginBottom: '1rem', 
            padding: '1rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ fontSize: '1.5rem' }}>📄</div>
              <div>
                <h4 style={{ color: '#666FD0', margin: 0 }}>Chatting with: {uploadedFileName}</h4>
                <p style={{ color: '#6c757d', margin: 0, fontSize: '0.9rem' }}>Ask me anything about this document</p>
              </div>
              <button
                onClick={() => {
                  setSessionId(null);
                  setUploadedFileName('');
                  setChatHistory([]);
                  setFile(null);
                }}
                style={{
                  marginLeft: 'auto',
                  padding: '0.5rem 1rem',
                  background: '#666FD0',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                📄 Upload New PDF
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="card" style={{ 
            flex: 1, 
            padding: '1rem', 
            marginBottom: '1rem',
            maxHeight: '500px',
            overflowY: 'auto',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            {chatHistory.map((message, index) => (
              <div key={index} style={{
                marginBottom: '1rem',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '1rem',
                  borderRadius: '12px',
                  background: message.role === 'user' 
                    ? '#666FD0' 
                    : '#f8f9fa',
                  color: message.role === 'user' ? 'white' : '#0E0F22',
                  lineHeight: '1.6',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: message.role === 'user' ? 'none' : '1px solid #e9ecef'
                }}>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    color: message.role === 'user' ? 'rgba(255,255,255,0.8)' : '#666FD0',
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    {message.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                  </div>
                  {message.content}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '1rem' }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: '#f8f9fa',
                  color: '#6c757d',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{ fontSize: '0.8rem', color: '#666FD0', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    🤖 AI Assistant
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                    Thinking...
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Message Input */}
          <div className="card" style={{ 
            padding: '1rem',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your document... (e.g., 'What are my main obligations?')"
                style={{
                  flex: 1,
                  padding: '1rem',
                  background: '#ffffff',
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  color: '#0E0F22',
                  fontSize: '1rem',
                  resize: 'vertical',
                  minHeight: '50px',
                  maxHeight: '150px',
                  fontFamily: 'inherit'
                }}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!currentQuestion.trim() || isLoading}
                style={{
                  padding: '1rem 2rem',
                  minWidth: '100px',
                  background: !currentQuestion.trim() || isLoading 
                    ? '#e9ecef' 
                    : '#666FD0',
                  color: !currentQuestion.trim() || isLoading ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: !currentQuestion.trim() || isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease'
                }}
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </div>
            
            {/* Suggested Questions */}
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: '#6c757d', fontSize: '0.9rem', marginBottom: '0.5rem' }}>💡 Try asking:</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[
                  "What are my main obligations?",
                  "What are the termination conditions?",
                  "What risks should I be aware of?",
                  "Summarize this document"
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(suggestion)}
                    disabled={isLoading}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(102, 111, 208, 0.05)',
                      border: '1px solid rgba(102, 111, 208, 0.2)',
                      borderRadius: '20px',
                      color: '#666FD0',
                      fontSize: '0.8rem',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      transition: 'all 0.3s ease',
                      opacity: isLoading ? 0.5 : 1,
                      fontWeight: '500'
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        e.target.style.background = 'rgba(102, 111, 208, 0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        e.target.style.background = 'rgba(102, 111, 208, 0.05)';
                      }
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWithPDF;
