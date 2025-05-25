const chatService = require('../services/chatService');
const pdfParse = require('pdf-parse');

const uploadAndPrepareDocument = async (req, res) => {
  try {
    console.log('=== UPLOAD AND PREPARE DOCUMENT ===');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    console.log('File received:', req.file.originalname);
    
    // Extract text from PDF
    const data = await pdfParse(req.file.buffer);
    const documentText = data.text;
    
    console.log('PDF text extracted, length:', documentText.length);
    
    // Generate session ID
    const sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    
    // Store document context for chat
    chatService.storeDocumentContext(sessionId, documentText);
    
    console.log('Document prepared for chat, session:', sessionId);
    
    res.json({
      success: true,
      sessionId: sessionId,
      filename: req.file.originalname,
      message: 'Document uploaded successfully! You can now ask questions about it.',
      documentLength: documentText.length
    });
    
  } catch (error) {
    console.error('Document preparation error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const chatWithDocument = async (req, res) => {
  try {
    console.log('=== CHAT WITH DOCUMENT CONTROLLER ===');
    
    const { sessionId, question, chatHistory } = req.body;
    
    console.log('Session ID:', sessionId);
    console.log('Question:', question);
    console.log('Chat History Length:', chatHistory?.length || 0);
    
    if (!sessionId || !question) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and question are required'
      });
    }

    // Get AI response
    const result = await chatService.chatWithDocument(sessionId, question, chatHistory || []);
    
    console.log('Chat service result:', result.success ? 'Success' : 'Failed');
    
    res.json(result);
    
  } catch (error) {
    console.error('Chat controller error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  uploadAndPrepareDocument,
  chatWithDocument
};
