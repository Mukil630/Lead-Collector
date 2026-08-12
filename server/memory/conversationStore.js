/**
 * 🧠 CONVERSATION STORE & STATE MEMORY MODULE (server/memory/conversationStore.js)
 * Tracks conversation history, business type, project type, features, lead score, and lead stage.
 */

const conversationStore = {};

export function getOrCreateSession(senderId) {
  if (!conversationStore[senderId]) {
    conversationStore[senderId] = {
      senderId: senderId,
      conversation_history: [],
      customer_name: null,
      business_name: null,
      business_type: null,    // e.g., 'Bakery', 'Boutique', 'Clinic', 'Restaurant', 'School', 'Retail Shop'
      project_type: null,     // e.g., 'Website', 'Mobile App', 'WhatsApp AI Bot', 'POS Billing'
      features: [],           // e.g., ['Online Ordering', 'UPI QR', 'Thermal Printing']
      lead_stage: 'NEW',      // 'NEW' | 'GREETING' | 'CURIOUS' | 'SOLUTION_RECOMMENDATION' | 'REQUIREMENT_COLLECTION' | 'QUALIFIED_LEAD' | 'HUMAN_HANDOFF'
      lead_score: 50,         // 0 - 100 lead qualification score
      current_intent: 'UNKNOWN',
      last_intent: 'UNKNOWN',
      extracted_requirements: []
    };
  }
  return conversationStore[senderId];
}

export function updateSessionEntity(senderId, key, value) {
  const session = getOrCreateSession(senderId);
  if (value !== undefined && value !== null) {
    session[key] = value;
  }
  return session;
}

export function addMessageToHistory(senderId, role, content) {
  const session = getOrCreateSession(senderId);
  session.conversation_history.push({ role, content, timestamp: new Date().toISOString() });
  return session;
}

export function getSessionHistory(senderId, limit = 10) {
  const session = getOrCreateSession(senderId);
  return session.conversation_history.slice(-limit);
}
