import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const uploadDocumentForChat = async (file) => {
  const formData = new FormData();
  formData.append('pdf', file);
  
  const response = await axios.post(`${API_BASE}/chat/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const chatWithDocument = async (sessionId, question, chatHistory = []) => {
  const response = await axios.post(`${API_BASE}/chat/chat`, {
    sessionId,
    question,
    chatHistory
  });
  
  return response.data;
};
