const axios = require('axios');
const FormData = require('form-data');
const LawyerVerification = require('../models/LawyerVerification');

class LawyerVerificationService {
  
  // ✅ AADHAAR VERIFICATION (Using Government API)
  async verifyAadhaar(aadhaarNumber, name, phone) {
    try {
      // Simulate UIDAI API call (replace with actual API)
      const response = await axios.post('https://api.uidai.gov.in/verify', {
        aadhaar: aadhaarNumber,
        name: name,
        phone: phone
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.UIDAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        verified: response.data.status === 'valid',
        confidence: response.data.confidence || 0,
        details: response.data
      };
    } catch (error) {
      console.error('Aadhaar verification error:', error);
      return { verified: false, confidence: 0, error: error.message };
    }
  }

  // ✅ PAN VERIFICATION (Using Income Tax API)
  async verifyPAN(panNumber, name) {
    try {
      const response = await axios.post('https://api.incometax.gov.in/verify-pan', {
        pan: panNumber,
        name: name
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.IT_DEPT_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        verified: response.data.valid === true,
        nameMatch: response.data.nameMatch || false,
        details: response.data
      };
    } catch (error) {
      console.error('PAN verification error:', error);
      return { verified: false, nameMatch: false, error: error.message };
    }
  }

  // ✅ BAR COUNCIL VERIFICATION (Using BCI Database)
  async verifyBarCouncil(advocateCode, barRegistrationNumber, stateBarCouncil) {
    try {
      // Simulate Bar Council of India API
      const response = await axios.post('https://api.barcouncilofindia.org/verify', {
        advocateCode: advocateCode,
        registrationNumber: barRegistrationNumber,
        stateCouncil: stateBarCouncil
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.BCI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        verified: response.data.status === 'active',
        enrollmentDate: response.data.enrollmentDate,
        practiceStatus: response.data.practiceStatus,
        details: response.data
      };
    } catch (error) {
      console.error('Bar Council verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  // ✅ UNIVERSITY DEGREE VERIFICATION
  async verifyUniversityDegree(university, rollNumber, graduationYear, degreeType) {
    try {
      // Simulate University Grants Commission (UGC) API
      const response = await axios.post('https://api.ugc.ac.in/verify-degree', {
        university: university,
        rollNumber: rollNumber,
        year: graduationYear,
        degree: degreeType
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.UGC_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      return {
        verified: response.data.valid === true,
        degreeDetails: response.data.degree,
        university: response.data.university,
        details: response.data
      };
    } catch (error) {
      console.error('University verification error:', error);
      return { verified: false, error: error.message };
    }
  }

  // ✅ AI DOCUMENT AUTHENTICITY CHECK
  async verifyDocumentAuthenticity(documentPath, documentType) {
    try {
      const formData = new FormData();
      formData.append('document', documentPath);
      formData.append('type', documentType);
      
      // Using AI service like AWS Textract or Google Document AI
      const response = await axios.post('https://api.aws.amazon.com/textract/analyze', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.AWS_API_KEY}`,
          ...formData.getHeaders()
        }
      });
      
      return {
        authentic: response.data.confidence > 0.85,
        confidence: response.data.confidence,
        extractedData: response.data.extractedText,
        fraudFlags: response.data.fraudIndicators || []
      };
    } catch (error) {
      console.error('Document authenticity check error:', error);
      return { authentic: false, confidence: 0, error: error.message };
    }
  }

  // ✅ FACIAL RECOGNITION VERIFICATION
  async verifyFaceMatch(aadhaarPhoto, submittedPhoto) {
    try {
      const formData = new FormData();
      formData.append('image1', aadhaarPhoto);
      formData.append('image2', submittedPhoto);
      
      // Using AWS Rekognition or similar service
      const response = await axios.post('https://api.aws.amazon.com/rekognition/compare-faces', formData, {
        headers: {
          'Authorization': `Bearer ${process.env.AWS_REKOGNITION_KEY}`,
          ...formData.getHeaders()
        }
      });
      
      return {
        match: response.data.similarity > 0.90,
        similarity: response.data.similarity,
        confidence: response.data.confidence
      };
    } catch (error) {
      console.error('Face verification error:', error);
      return { match: false, similarity: 0, error: error.message };
    }
  }

  // ✅ COMPREHENSIVE VERIFICATION PROCESS
  async performCompleteVerification(applicationId) {
    try {
      const application = await LawyerVerification.findOne({ applicationId });
      if (!application) {
        throw new Error('Application not found');
      }

      console.log(`🔍 Starting verification for application: ${applicationId}`);
      
      // Step 1: Aadhaar Verification
      const aadhaarResult = await this.verifyAadhaar(
        application.personalInfo.aadhaarNumber,
        application.personalInfo.fullName,
        application.personalInfo.phone
      );
      
      // Step 2: PAN Verification
      const panResult = await this.verifyPAN(
        application.personalInfo.panNumber,
        application.personalInfo.fullName
      );
      
      // Step 3: Bar Council Verification
      const barResult = await this.verifyBarCouncil(
        application.legalCredentials.advocateCode,
        application.legalCredentials.barRegistrationNumber,
        application.legalCredentials.stateBarCouncil
      );
      
      // Step 4: University Verification
      const universityResult = await this.verifyUniversityDegree(
        application.legalCredentials.lawDegree.university,
        application.legalCredentials.lawDegree.rollNumber,
        application.legalCredentials.lawDegree.graduationYear,
        application.legalCredentials.lawDegree.degreeType
      );
      
      // Step 5: Document Authenticity
      const docResults = await Promise.all([
        this.verifyDocumentAuthenticity(application.documents.aadhaarCard, 'aadhaar'),
        this.verifyDocumentAuthenticity(application.documents.panCard, 'pan'),
        this.verifyDocumentAuthenticity(application.documents.lawDegreeMarksheet, 'degree')
      ]);
      
      // Step 6: Face Match
      const faceResult = await this.verifyFaceMatch(
        application.documents.aadhaarCard, // Extract photo from Aadhaar
        application.documents.photograph
      );
      
      // Calculate overall verification score
      const verificationScore = this.calculateVerificationScore({
        aadhaar: aadhaarResult,
        pan: panResult,
        barCouncil: barResult,
        university: universityResult,
        documents: docResults,
        faceMatch: faceResult
      });
      
      // Update application with results
      await LawyerVerification.findOneAndUpdate(
        { applicationId },
        {
          'verification.steps.aadhaarVerification': {
            completed: true,
            timestamp: new Date(),
            verified: aadhaarResult.verified
          },
          'verification.steps.panVerification': {
            completed: true,
            timestamp: new Date(),
            verified: panResult.verified
          },
          'verification.steps.barCouncilVerification': {
            completed: true,
            timestamp: new Date(),
            verified: barResult.verified
          },
          'verification.steps.universityVerification': {
            completed: true,
            timestamp: new Date(),
            verified: universityResult.verified
          },
          'aiVerification.documentAuthenticity': {
            aadhaar: docResults[0],
            pan: docResults[1],
            degree: docResults[2]
          },
          'aiVerification.faceMatch': faceResult,
          'aiVerification.fraudDetection': {
            riskScore: verificationScore.riskScore,
            flags: verificationScore.flags
          },
          'verification.status': verificationScore.approved ? 'approved' : 'rejected',
          'verification.verificationDate': new Date()
        }
      );
      
      console.log(`✅ Verification completed for ${applicationId}: ${verificationScore.approved ? 'APPROVED' : 'REJECTED'}`);
      
      return {
        success: true,
        approved: verificationScore.approved,
        score: verificationScore.totalScore,
        details: verificationScore
      };
      
    } catch (error) {
      console.error('Verification process error:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ CALCULATE VERIFICATION SCORE
  calculateVerificationScore(results) {
    let totalScore = 0;
    let maxScore = 100;
    const flags = [];
    
    // Aadhaar (25 points)
    if (results.aadhaar.verified) totalScore += 25;
    else flags.push('Aadhaar verification failed');
    
    // PAN (20 points)
    if (results.pan.verified && results.pan.nameMatch) totalScore += 20;
    else flags.push('PAN verification failed');
    
    // Bar Council (30 points) - Most critical
    if (results.barCouncil.verified) totalScore += 30;
    else flags.push('Bar Council verification failed');
    
    // University (15 points)
    if (results.university.verified) totalScore += 15;
    else flags.push('University verification failed');
    
    // Document Authenticity (5 points each)
    results.documents.forEach((doc, index) => {
      if (doc.authentic) totalScore += 3.33;
      else flags.push(`Document ${index + 1} authenticity failed`);
    });
    
    // Face Match (5 points)
    if (results.faceMatch.match) totalScore += 5;
    else flags.push('Face verification failed');
    
    const riskScore = Math.max(0, 100 - totalScore);
    const approved = totalScore >= 85 && flags.length <= 1; // Minimum 85% with max 1 minor flag
    
    return {
      totalScore,
      riskScore,
      flags,
      approved,
      breakdown: {
        aadhaar: results.aadhaar.verified ? 25 : 0,
        pan: results.pan.verified ? 20 : 0,
        barCouncil: results.barCouncil.verified ? 30 : 0,
        university: results.university.verified ? 15 : 0,
        documents: Math.round(results.documents.filter(d => d.authentic).length * 3.33),
        faceMatch: results.faceMatch.match ? 5 : 0
      }
    };
  }
}

module.exports = new LawyerVerificationService();
