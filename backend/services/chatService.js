const { GoogleGenerativeAI } = require('@google/generative-ai');

class ChatService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    this.documentContext = new Map();
  }

  // Store document content for chat
  storeDocumentContext(sessionId, documentText) {
    this.documentContext.set(sessionId, {
      text: documentText,
      chunks: this.chunkText(documentText),
      timestamp: new Date()
    });
  }

  // Split document into manageable chunks
  chunkText(text, chunkSize = 1000) {
    const chunks = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.substring(i, i + chunkSize));
    }
    return chunks;
  }

  // Find relevant chunks for the question
  findRelevantChunks(question, chunks, maxChunks = 3) {
    const questionWords = question.toLowerCase().split(' ');
    
    const scoredChunks = chunks.map(chunk => {
      const chunkLower = chunk.toLowerCase();
      const score = questionWords.reduce((acc, word) => {
        return acc + (chunkLower.includes(word) ? 1 : 0);
      }, 0);
      return { chunk, score };
    });

    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, maxChunks)
      .map(item => item.chunk);
  }

  // Generate AI response with Gemini
  async chatWithDocument(sessionId, question, chatHistory = []) {
    try {
      const documentData = this.documentContext.get(sessionId);
      
      if (!documentData) {
        throw new Error('No document found for this session. Please upload a document first.');
      }

      // Find relevant content
      const relevantChunks = this.findRelevantChunks(question, documentData.chunks);
      const context = relevantChunks.join('\n\n');

      // Build conversation history
      let conversationHistory = '';
      chatHistory.forEach(msg => {
        conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });

      // Create prompt for Gemini
      const prompt = `You are a helpful AI legal assistant. Answer questions about the uploaded legal document based ONLY on the provided context.

Rules:
- Use simple, clear language that non-lawyers can understand
- If the answer isn't in the document, say "I cannot find this information in the uploaded document"
- Be specific and cite relevant parts when possible
- Explain legal terms in plain English
- Focus on practical implications for the user

Document Context:
${context}

Previous Conversation:
${conversationHistory}

User Question: ${question}

Assistant Response:`;

      // Generate response with Gemini
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const answer = response.text();

      return {
        success: true,
        answer: answer,
        relevantContext: relevantChunks.length > 0
      };

    } catch (error) {
      console.error('Gemini chat service error:', error);
      return {
        success: false,
        error: error.message,
        answer: 'I apologize, but I encountered an error while processing your question. Please try again.'
      };
    }
  }

  // Clear document context (optional cleanup)
  clearDocumentContext(sessionId) {
    this.documentContext.delete(sessionId);
  }
}

module.exports = new ChatService();

