/**
 * 🧠 SERVER GROQ AI AGENT WRAPPER (server/groqEngine.js)
 * Forwards to Modular Autonomous AI Sales Agent Engine (server/ai/responseGenerator.js)
 */

import { generateAutonomousAgentResponse } from './ai/responseGenerator.js';
import { getOrCreateSession } from './memory/conversationStore.js';

export { getOrCreateSession };

export function detectLanguage(text) {
  const t = (text || '').toLowerCase();
  if (/[\u0B80-\u0BFF]/.test(text)) return 'Tamil Script';
  if (['evlo', 'panna', 'bro', 'solunga', 'puriyala', 'tamil'].some(k => t.includes(k))) return 'Tanglish';
  return 'English';
}

export async function processConversationMessage(senderId, userMessage, apiKey = '') {
  return generateAutonomousAgentResponse(senderId, userMessage, apiKey);
}

export function prepareGroqSalesReply(userMessage, shopInfo = {}) {
  const senderId = shopInfo.phone || 'default-session';
  return processConversationMessage(senderId, userMessage);
}
