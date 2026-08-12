/**
 * 🚀 AUTONOMOUS AI SALES AGENT RESPONSE GENERATOR (server/ai/responseGenerator.js)
 * Orchestrates Memory State + Intent Router + LangGraph Workflow Tools + RAG Retriever + Groq LLM.
 */

import { getOrCreateSession, addMessageToHistory } from '../memory/conversationStore.js';
import { retrieveRelevantContext } from './retriever.js';
import { routeUserIntent } from './intentRouter.js';
import { executeLangGraphWorkflow } from './langgraphWorkflow.js';
import { buildSystemPrompt, buildMessagesPayload } from './promptBuilder.js';
import { generateGroqCompletion } from './groqClient.js';

export async function generateAutonomousAgentResponse(senderId, userMessage, apiKey = '') {
  // 1. Session Memory Lookup
  const session = getOrCreateSession(senderId);

  // 2. Append User Input to Memory
  addMessageToHistory(senderId, 'user', userMessage);

  // 3. Intent Routing & Structured State Extraction
  const structuredState = routeUserIntent(userMessage, session);

  // 4. LangGraph Workflow Execution & Tool Calling (save_lead, update_lead, notify_sales_team)
  const workflowResult = executeLangGraphWorkflow(senderId, session, structuredState);

  // 5. RAG Semantic Context Retrieval from server/knowledge/ Markdown Files
  const retrievedChunks = retrieveRelevantContext(userMessage, 3);
  const contextText = retrievedChunks.map(c => c.content).join('\n\n---\n\n');

  // 6. Context-Aware System Prompt Assembly
  const systemPrompt = buildSystemPrompt(session, contextText, structuredState);
  const messagesPayload = buildMessagesPayload(session, systemPrompt);

  // 7. Groq LLaMA-3.1 8B LLM Completion Call
  let aiReply = await generateGroqCompletion(messagesPayload, { apiKey });

  if (!aiReply) {
    if (structuredState.intent === 'SOLUTION_RECOMMENDATION' && session.business_type) {
      aiReply = `Nice! For a ${session.business_type}, we could build an online ordering website, POS billing system, customer management tool, or WhatsApp ordering automation! What is your main requirement, bro?`;
    } else {
      aiReply = `Vanakkam, bro! Welcome to VIZRO Vertex Solutions! Tell me what app, website, or AI tool you wish to build today, or ask any question!`;
    }
  }

  aiReply = aiReply.replace(/<br>/g, '\n').replace(/<strong>/g, '*').replace(/<\/strong>/g, '*');

  // 8. Append AI Reply to Session Memory
  addMessageToHistory(senderId, 'assistant', aiReply);

  return {
    replyText: aiReply,
    leadStage: session.lead_stage,
    leadScore: session.lead_score,
    intent: structuredState.intent,
    businessType: session.business_type,
    projectType: session.project_type,
    extractedFeatures: session.features,
    executedTools: workflowResult.executedTools,
    engine: `Autonomous AI Sales Agent (Groq LLaMA-3.1 8B + LangGraph Tools)`
  };
}
