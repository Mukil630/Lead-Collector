/**
 * 🕸️ LANGGRAPH WORKFLOW CONTROLLER & TOOL EXECUTOR (server/ai/langgraphWorkflow.js)
 * Manages structured state transitions and triggers autonomous tool calling:
 * - saveLeadTool()
 * - updateLeadScoreTool()
 * - saveRequirementTool()
 * - notifySalesTeamTool()
 */

import { saveLeadTool, updateLeadScoreTool, saveRequirementTool, notifySalesTeamTool } from './tools.js';

export function executeLangGraphWorkflow(senderId, session, structuredState) {
  const executedTools = [];

  // Calculate Lead Qualification Score (0 - 100)
  let score = 50;
  if (session.business_type) score += 15;
  if (session.project_type) score += 15;
  if (session.features.length > 0) score += 10;
  if (structuredState.intent === 'REQUIREMENT_COLLECTION') score += 10;

  session.lead_score = Math.min(score, 100);

  // Workflow State Machine Decisions
  if (structuredState.needsHuman) {
    const notifyRes = notifySalesTeamTool(senderId, session);
    executedTools.push({ tool: 'notify_sales_team', result: notifyRes });
  }

  if (session.lead_score >= 85 || structuredState.intent === 'REQUIREMENT_COLLECTION') {
    updateLeadScoreTool(session, session.lead_score, 'QUALIFIED_LEAD');
    const saveRes = saveLeadTool(senderId, {
      businessType: session.business_type,
      projectType: session.project_type,
      features: session.features,
      leadScore: session.lead_score,
      leadStage: session.lead_stage
    });
    executedTools.push({ tool: 'save_lead', result: saveRes });
  }

  if (structuredState.extractedFeatures.length > 0) {
    const reqRes = saveRequirementTool(session, `Features: ${session.features.join(', ')}`);
    executedTools.push({ tool: 'save_requirement', result: reqRes });
  }

  return {
    nextStep: structuredState.intent,
    leadScore: session.lead_score,
    executedTools: executedTools
  };
}
