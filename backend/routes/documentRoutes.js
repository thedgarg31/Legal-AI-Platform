const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'document-' + uniqueSuffix + '.pdf');
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Simple AI Analysis
const analyzeDocument = (text) => {
  console.log('🤖 Starting document analysis...');
  
  // Document type detection
  const documentTypes = {
    'contract': ['agreement', 'contract', 'terms', 'party', 'whereas', 'hereby'],
    'lease': ['lease', 'rent', 'tenant', 'landlord', 'premises'],
    'employment': ['employment', 'employee', 'employer', 'salary', 'benefits'],
    'nda': ['confidential', 'non-disclosure', 'proprietary', 'confidentiality'],
    'purchase': ['purchase', 'sale', 'buyer', 'seller', 'goods']
  };

  let detectedType = 'general';
  let maxScore = 0;

  for (const [type, keywords] of Object.entries(documentTypes)) {
    const score = keywords.filter(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ).length;
    
    if (score > maxScore) {
      maxScore = score;
      detectedType = type;
    }
  }

  // Risk assessment
  const riskKeywords = ['penalty', 'terminate', 'breach', 'default', 'liability', 'damages'];
  const riskCount = riskKeywords.filter(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase())
  ).length;

  let riskLevel = 'Low';
  if (riskCount >= 4) riskLevel = 'High';
  else if (riskCount >= 2) riskLevel = 'Medium';

  // Generate analysis
  const analysis = {
    documentType: detectedType,
    keyPoints: [
      `Document identified as ${detectedType}`,
      `${text.split(' ').length} words analyzed`,
      `${riskCount} potential risk indicators found`
    ],
    legalIssues: [
      'Review all terms and conditions carefully',
      'Verify compliance with applicable laws',
      'Consider legal consultation for complex clauses'
    ],
    recommendations: [
      'Have a legal expert review this document',
      'Ensure all parties understand their obligations',
      'Keep a signed copy for your records'
    ],
    riskLevel: riskLevel,
    summary: `This ${detectedType} document contains ${text.split(' ').length} words and has been analyzed for potential legal issues.`,
    confidence: Math.min(maxScore * 20 + 60, 95)
  };

  console.log('✅ Analysis completed:', analysis.documentType, analysis.riskLevel);
  return analysis;
};

// Enhanced AI Response using Gemini API
const generateAIResponse = async (userMessage, analysis, documentText) => {
  try {
    if (!analysis) {
      return "I need to analyze a document first before I can help you. Please upload a document and try again.";
    }

    console.log('🤖 Using Gemini AI for response generation...');
    
    // Create context-rich prompt for Gemini
    const prompt = `You are a professional legal AI assistant helping users understand their legal documents. 

DOCUMENT ANALYSIS:
- Document Type: ${analysis.documentType}
- Risk Level: ${analysis.riskLevel}
- Confidence: ${analysis.confidence}%
- Summary: ${analysis.summary}
- Key Points: ${analysis.keyPoints?.join(', ')}
- Legal Issues: ${analysis.legalIssues?.join(', ')}
- Recommendations: ${analysis.recommendations?.join(', ')}

DOCUMENT CONTENT EXCERPT:
${documentText ? documentText.substring(0, 2000) : 'Full text not available'}...

USER QUESTION: "${userMessage}"

Please provide a helpful, accurate, and specific response about this legal document. Focus on:
1. Directly answering the user's question
2. Referencing specific aspects of their document when relevant
3. Providing practical legal guidance
4. Mentioning when they should consult a lawyer
5. Being clear and professional

Keep your response concise but informative (2-3 paragraphs maximum). Use formatting like **bold** for important points.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponse = response.text();
    
    console.log('✅ Gemini AI response generated successfully');
    return aiResponse;
    
  } catch (error) {
    console.error('❌ Gemini AI error:', error);
    
    // Fallback to basic response if Gemini fails
    return `I understand you're asking about "${userMessage}". Based on your ${analysis.documentType} document with ${analysis.riskLevel} risk level: ${analysis.summary} For specific legal advice, I recommend consulting with a qualified attorney.`;
  }
};

// Upload and analyze PDF
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    console.log('📄 Document upload started');
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('📄 File received:', req.file.originalname);

    // Extract text from PDF
    const pdfBuffer = fs.readFileSync(req.file.path);
    console.log('📄 Reading PDF file...');
    
    const pdfData = await pdfParse(pdfBuffer);
    console.log('📄 Text extracted, length:', pdfData.text.length);

    // Analyze document
    const analysis = analyzeDocument(pdfData.text);

    // Create response
    const result = {
      id: Date.now().toString(),
      originalName: req.file.originalname,
      fileSize: req.file.size,
      status: 'analyzed',
      analysis: analysis,
      uploadDate: new Date(),
      analysisDate: new Date(),
      extractedText: pdfData.text  // ✅ CRUCIAL: Include extracted text for AI
    };

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    console.log('📄 Temporary file cleaned up');

    console.log('✅ Document analysis completed successfully');

    res.json({
      success: true,
      message: 'Document uploaded and analyzed successfully',
      document: result
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      success: false,
      message: 'Document analysis failed',
      error: error.message
    });
  }
});

// AI Chat endpoint with Gemini integration
router.post('/chat', async (req, res) => {
  try {
    const { message, documentId, documentAnalysis, documentText } = req.body;
    
    console.log('🤖 AI Chat request:', message);
    console.log('📄 Document analysis:', documentAnalysis);
    
    // Generate AI response using Gemini (async)
    const response = await generateAIResponse(message, documentAnalysis, documentText);
    
    console.log('🤖 AI Response generated:', response.substring(0, 100) + '...');
    
    res.json({
      success: true,
      response: response
    });
    
  } catch (error) {
    console.error('❌ AI Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'AI chat failed',
      error: error.message
    });
  }
});

// Get document by ID (optional endpoint)
router.get('/:id', async (req, res) => {
  try {
    // This is a placeholder for document retrieval
    // You can implement database storage if needed
    res.json({
      success: false,
      message: 'Document retrieval not implemented for standalone analysis'
    });
  } catch (error) {
    console.error('❌ Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve document',
      error: error.message
    });
  }
});

module.exports = router;
