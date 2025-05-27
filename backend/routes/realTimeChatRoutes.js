const express = require('express');
const router = express.Router();
const { 
  createChatRoom, 
  getChatHistory, 
  endChatSession 
} = require('../controllers/realTimeChatController');

// Create or get chat room
router.post('/room', createChatRoom);

// Get chat history
router.get('/room/:chatRoomId', getChatHistory);

// End chat session
router.put('/room/:chatRoomId/end', endChatSession);

module.exports = router;
