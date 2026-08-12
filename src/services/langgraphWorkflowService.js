/**
 * 🧠 LangGraph B2B Lead Automation Workflow State Machine Service
 * Connects Phase 1 (Google Maps Collector & Lead DB) with Phase 2 Modular Pipeline
 * (Lead Fetcher ➔ WhatsApp Checker ➔ Message Generator ➔ WhatsApp Sender ➔ Status Manager)
 */

import { CampaignManager } from '../phase2/campaignManager.js';
import { LEAD_STATUS } from '../phase2/statusManager.js';

export const LANGGRAPH_WORKFLOW_NODES = [
  {
    id: 'google_collector',
    phase: 1,
    label: 'Phase 1: Google Maps Collector',
    type: 'collector',
    desc: 'Scrapes business listings from Google Maps & live web search',
    outputKey: 'raw_collected_leads'
  },
  {
    id: 'lead_db_store',
    phase: 1,
    label: 'Lead Database (status = NEW)',
    type: 'database',
    desc: 'Persists business_name, phone_number, location, email, source, status=NEW',
    outputKey: 'lead_database'
  },
  {
    id: 'lead_fetcher',
    phase: 2,
    label: 'Phase 2: Lead Fetcher',
    type: 'node',
    desc: 'Query Lead DB for pending leads where status == "NEW"',
    outputKey: 'fetched_new_leads'
  },
  {
    id: 'whatsapp_checker',
    phase: 2,
    label: 'WhatsApp Checker',
    type: 'conditional_node',
    desc: 'Check if phone_number is registered and reachable on WhatsApp socket',
    outputKey: 'wa_checker_result'
  },
  {
    id: 'whatsapp_not_found',
    phase: 2,
    label: 'WHATSAPP_NOT_FOUND (Branch: NO)',
    type: 'branch_no',
    desc: 'Landline / No WhatsApp -> Set status = "WHATSAPP_NOT_FOUND" & log reason',
    outputKey: 'not_found_log'
  },
  {
    id: 'message_generator',
    phase: 2,
    label: 'Message Generator (Branch: YES)',
    type: 'node',
    desc: 'Generates company advertisement pitch for business_name & category',
    outputKey: 'generated_pitch_message'
  },
  {
    id: 'whatsapp_sender',
    phase: 2,
    label: 'WhatsApp Sender',
    type: 'node',
    desc: 'Dispatches advertisement message & sets status = "MESSAGE_SENDING"',
    outputKey: 'whatsapp_dispatch_payload'
  },
  {
    id: 'status_manager',
    phase: 2,
    label: 'Status Manager',
    type: 'node',
    desc: 'Mutates lead status in Lead DB to "MESSAGE_SENT" with timestamp',
    outputKey: 'updated_lead_db'
  }
];

export async function executeLangGraphWorkflow(leads, senderConfig = {}, onNodeExecuteCallback = null) {
  const workflowState = {
    workflow_id: 'lg-flow-' + Date.now(),
    execution_status: 'RUNNING',
    start_time: new Date().toISOString(),
    phase_1: {
      collector_source: 'Google Maps & Web Scraper',
      total_collected: leads.length,
      lead_database_schema: ['business_name', 'phone_number', 'location', 'email', 'source', 'status']
    },
    phase_2: {
      fetched_count: 0,
      validated_yes_count: 0,
      skipped_no_count: 0,
      messages_sent_count: 0
    },
    logs: [],
    leads_processed: []
  };

  // Step 0: Google Maps Collector (Phase 1)
  if (onNodeExecuteCallback) {
    await onNodeExecuteCallback(0, 'google_collector', {
      state: workflowState,
      current_step_desc: 'Phase 1: Collecting leads from Google Maps...'
    });
  }

  // Step 1: Lead Database (Phase 1) - Ensure initial status = NEW
  leads.forEach(l => {
    if (!l.status) l.status = LEAD_STATUS.NEW;
  });

  workflowState.logs.push(`Phase 1 Complete: Saved ${leads.length} leads in Lead Database with status = "NEW".`);

  if (onNodeExecuteCallback) {
    await onNodeExecuteCallback(1, 'lead_db_store', {
      state: workflowState,
      current_step_desc: 'Phase 1 Complete: Stored leads in DB with status = "NEW"'
    });
  }

  // Step 2-7: Execute Phase 2 Campaign Manager
  const campaignManager = new CampaignManager(
    leads,
    senderConfig.senderName || 'Mukil Arasu',
    senderConfig.companyName || 'Antigravity AI & Tech Solutions'
  );

  const pipelineSummary = await campaignManager.runPhase2Pipeline(async (nodeType, desc, payload) => {
    let nodeIdx = 2;
    if (nodeType === 'LEAD_FETCHER') nodeIdx = 2;
    else if (nodeType === 'WHATSAPP_CHECKER') nodeIdx = 3;
    else if (nodeType === 'MESSAGE_GENERATOR') nodeIdx = 5;
    else if (nodeType === 'WHATSAPP_SENDER') nodeIdx = 6;

    if (onNodeExecuteCallback) {
      await onNodeExecuteCallback(nodeIdx, nodeType, {
        state: workflowState,
        step_desc: desc,
        payload
      });
    }
  });

  workflowState.phase_2.fetched_count = pipelineSummary.fetchedCount;
  workflowState.phase_2.validated_yes_count = pipelineSummary.whatsappAvailableCount;
  workflowState.phase_2.skipped_no_count = pipelineSummary.whatsappNotFoundCount;
  workflowState.phase_2.messages_sent_count = pipelineSummary.messagesSentCount;
  workflowState.execution_status = 'COMPLETED';
  workflowState.end_time = new Date().toISOString();

  return workflowState;
}
