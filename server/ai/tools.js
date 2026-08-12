/**
 * 🛠️ AUTONOMOUS AI SALES AGENT TOOLS (server/ai/tools.js)
 * Executes actions: saving leads, updating scores, logging requirements, and triggering sales notifications.
 */

import fs from 'fs';
import path from 'path';

const LEADS_FILE_PATH = path.join(process.cwd(), 'data', 'qualified_leads.csv');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(LEADS_FILE_PATH))) {
  fs.mkdirSync(path.dirname(LEADS_FILE_PATH), { recursive: true });
}

export function saveLeadTool(senderId, leadData) {
  const timestamp = new Date().toISOString();
  const phone = senderId.replace(/[^0-9]/g, '');

  const row = `"${timestamp}","${phone}","${leadData.businessName || leadData.businessType || 'Local Business'}","${leadData.businessType || 'Retail'}","${leadData.projectType || 'Custom Project'}","${(leadData.features || []).join('; ')}","${leadData.leadScore || 85}","${leadData.leadStage || 'QUALIFIED_LEAD'}"\n`;

  try {
    if (!fs.existsSync(LEADS_FILE_PATH)) {
      const header = `"Timestamp","Phone","Business Name","Category","Project Type","Features","Qualification Score","Lead Stage"\n`;
      fs.writeFileSync(LEADS_FILE_PATH, header + row);
    } else {
      fs.appendFileSync(LEADS_FILE_PATH, row);
    }
    console.log(`[Tool Call: save_lead] Saved lead ${phone} (${leadData.businessType}) to qualified_leads.csv`);
    return { success: true, file: LEADS_FILE_PATH, leadScore: leadData.leadScore || 85 };
  } catch (err) {
    console.warn('[Tool Call Exception: save_lead]:', err.message);
    return { success: false, error: err.message };
  }
}

export function updateLeadScoreTool(session, score, stage) {
  session.lead_score = score;
  session.lead_stage = stage;
  console.log(`[Tool Call: update_lead] Lead ${session.senderId} score updated to ${score}/100 (${stage})`);
  return { success: true, score, stage };
}

export function saveRequirementTool(session, requirement) {
  if (!session.extracted_requirements) {
    session.extracted_requirements = [];
  }
  session.extracted_requirements.push(requirement);
  console.log(`[Tool Call: save_requirement] Logged requirement for ${session.senderId}: "${requirement}"`);
  return { success: true, totalRequirements: session.extracted_requirements.length };
}

export function notifySalesTeamTool(senderId, session) {
  const summary = `🚀 HIGH-PRIORITY HOT LEAD ALERT!
- Phone: ${senderId}
- Business Type: ${session.business_type || 'Unknown'}
- Project Need: ${session.project_type || 'Custom Software'}
- Features: ${(session.features || []).join(', ') || 'Not specified'}
- Lead Stage: ${session.lead_stage}
- Qualification Score: ${session.lead_score || 95}/100`;

  console.log(`[Tool Call: notify_sales_team]\n${summary}`);
  return { success: true, summary };
}
