import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

// Create or get chat room
export const createChatRoom = async ({ lawyerId, clientId }) => {
  try {
    console.log('🔄 Creating chat room:', { lawyerId, clientId });
    
    const response = await fetch('http://localhost:5000/api/real-time-chat/create-room', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ lawyerId, clientId })
    });

    const result = await response.json();
    console.log('✅ Chat room response:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Create chat room error:', error);
    return { success: false, message: 'Failed to create chat room' };
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
