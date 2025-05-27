import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create or get chat room
export const createChatRoom = async (data) => {
  try {
    const response = await axios.post(`${API_BASE}/real-time-chat/room`, data);
    return response.data;
  } catch (error) {
    console.error('Create chat room error:', error);
    throw error;
  }
};

// Get chat history
export const getChatHistory = async (chatRoomId) => {
  try {
    const response = await axios.get(`${API_BASE}/real-time-chat/room/${chatRoomId}`);
    return response.data;
  } catch (error) {
    console.error('Get chat history error:', error);
    throw error;
  }
};

// End chat session
export const endChatSession = async (chatRoomId) => {
  try {
    const response = await axios.put(`${API_BASE}/real-time-chat/room/${chatRoomId}/end`);
    return response.data;
  } catch (error) {
    console.error('End chat session error:', error);
    throw error;
  }
};
