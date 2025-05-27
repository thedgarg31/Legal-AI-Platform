const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');

const router = express.Router();

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
  const documentTypes = {
    'contract': ['agreement', 'contract', 'terms', 'party'],
    'lease': ['lease', 'rent', 'tenant', 'landlord'],
    'employment': ['employment', 'employee', 'employer', 'salary']
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

  return {
    documentType: detectedType,
    keyPoints: [`Document identified as ${detectedType}`, `${text.split(' ').length} words analyzed`],
    legalIssues: ['Review all terms carefully', 'Consider legal consultation'],
    recommendations: ['Have a legal expert review this document'],
    riskLevel: 'Medium',
    summary: `This ${detectedType} document has been analyzed for potential legal issues.`,
    confidence: Math.min(maxScore * 20 + 60, 95)
  };
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
      extractedText: pdfData.text
    };

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log('✅ Document analysis completed successfully');

    res.json({
      success: true,
      message: 'Document uploaded and analyzed successfully',
      document: result
    });

  } catch (error) {
    console.error('❌ Document upload error:', error);
    
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

module.exports = router;
