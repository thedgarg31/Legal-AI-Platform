import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Get all verified lawyers with optional filters
export const getAllLawyers = async (filters = {}) => {
  try {
    console.log('🔄 API: Fetching lawyers with filters:', filters);
    
    // Build query parameters
    const params = new URLSearchParams();
    if (filters.specialization) params.append('specialization', filters.specialization);
    if (filters.city) params.append('city', filters.city);
    if (filters.minExperience) params.append('minExperience', filters.minExperience);
    if (filters.maxFees) params.append('maxFees', filters.maxFees);
    
    const response = await axios.get(`${API_BASE}/lawyers?${params.toString()}`);
    
    console.log('✅ API: Lawyers fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Get lawyers error:', error);
    throw error;
  }
};

// Get lawyer by ID
export const getLawyerById = async (lawyerId) => {
  try {
    console.log('🔄 API: Fetching lawyer by ID:', lawyerId);
    
    const response = await axios.get(`${API_BASE}/lawyers/${lawyerId}`);
    
    console.log('✅ API: Lawyer fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Get lawyer by ID error:', error);
    throw error;
  }
};

// Register a new lawyer
export const registerLawyer = async (lawyerData, files) => {
  try {
    console.log('🔄 API: Registering lawyer...');
    
    const formData = new FormData();
    
    // Add text fields
    Object.keys(lawyerData).forEach(key => {
      if (Array.isArray(lawyerData[key])) {
        lawyerData[key].forEach(item => formData.append(key, item));
      } else {
        formData.append(key, lawyerData[key]);
      }
    });
    
    // Add files
    if (files) {
      Object.keys(files).forEach(key => {
        if (files[key]) {
          formData.append(key, files[key]);
        }
      });
    }
    
    const response = await axios.post(`${API_BASE}/lawyers`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('✅ API: Lawyer registered successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Register lawyer error:', error);
    throw error;
  }
};

// Update lawyer verification status (Admin only)
export const updateLawyerVerification = async (lawyerId, status, verifiedBy, rejectionReason) => {
  try {
    console.log('🔄 API: Updating lawyer verification status...');
    
    const response = await axios.put(`${API_BASE}/lawyers/${lawyerId}/verify`, {
      status,
      verifiedBy,
      rejectionReason
    });
    
    console.log('✅ API: Verification status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Update verification error:', error);
    throw error;
  }
};

// Get pending lawyers for verification (Admin only)
export const getPendingLawyers = async () => {
  try {
    console.log('🔄 API: Fetching pending lawyers...');
    
    const response = await axios.get(`${API_BASE}/lawyers/pending`);
    
    console.log('✅ API: Pending lawyers fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Get pending lawyers error:', error);
    throw error;
  }
};

// Update lawyer online status
export const updateLawyerOnlineStatus = async (lawyerId, isOnline) => {
  try {
    console.log('🔄 API: Updating lawyer online status...');
    
    const response = await axios.put(`${API_BASE}/lawyers/${lawyerId}/status`, {
      isOnline
    });
    
    console.log('✅ API: Online status updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ API: Update online status error:', error);
    throw error;
  }
};
