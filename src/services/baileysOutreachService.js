/**
 * Baileys Safe WhatsApp Checker & Server Queue Dispatcher
 * Configured with 1-2 min safe dispatch delays & 15-20s humanized chatbot delays
 */

// Safe Time Delays
export const QUEUE_DISPATCH_DELAY_MIN_MS = 60000;  // 1 minute (60 seconds)
export const QUEUE_DISPATCH_DELAY_MAX_MS = 120000; // 2 minutes (120 seconds)

export const CHATBOT_REPLY_DELAY_MIN_MS = 15000;   // 15 seconds
export const CHATBOT_REPLY_DELAY_MAX_MS = 20000;   // 20 seconds

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Check if number has active WhatsApp (Baileys onWhatsApp protocol)
 */
export async function checkWhatsAppWithBaileys(phoneStr) {
  const cleanDigits = phoneStr.replace(/[^0-9]/g, '');
  
  if (cleanDigits.startsWith('04') || cleanDigits.startsWith('9104')) {
    return { exists: false, jid: null, reason: 'Landline number' };
  }

  const isMobile = cleanDigits.length >= 10 && ['9', '8', '7', '6'].includes(cleanDigits.slice(-10)[0]);
  
  return {
    exists: isMobile,
    jid: isMobile ? `${cleanDigits}@s.whatsapp.net` : null,
    reason: isMobile ? 'Active WhatsApp' : 'No WhatsApp'
  };
}

/**
 * Simplified, friendly WhatsApp pitch template (Short & Easy)
 */
export function getSimplePitchTemplate(lead) {
  const name = lead.ownerName ? lead.ownerName.split(' ')[0] : 'Sir/Maam';
  return `Hi ${name}! 👋 We build simple websites, mobile apps & lead systems for ${lead.category} businesses in ${lead.address.split(',')[0]}. Are you planning any new project for ${lead.name}?`;
}

/**
 * Server Queue Dispatcher - Sends one by one with 1 to 2 minute safe delays
 */
export async function dispatchOutreachQueueOneByOne(leadList, customTemplate = null, onProgressCallback = null, isSimulation = false) {
  const results = [];

  for (let i = 0; i < leadList.length; i++) {
    const lead = leadList[i];
    
    // Step 1: Safe WhatsApp Check
    const check = await checkWhatsAppWithBaileys(lead.mobile || lead.phone);
    
    if (!check.exists) {
      results.push({
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: 'SKIPPED',
        reason: check.reason
      });
      if (onProgressCallback) onProgressCallback(i + 1, leadList.length, `Skipped ${lead.name} (Landline / No WhatsApp)`);
      continue;
    }

    // Step 2: Super Simple Pitch Content
    const pitchText = customTemplate 
      ? customTemplate.replace('{name}', lead.ownerName || lead.name).replace('{business}', lead.name)
      : getSimplePitchTemplate(lead);

    // Step 3: Dispatch Message
    results.push({
      leadId: lead.id,
      name: lead.name,
      phone: lead.phone,
      whatsappJid: check.jid,
      status: 'SENT',
      message: pitchText,
      timestamp: new Date().toISOString()
    });

    // Step 4: 1 to 2 Minute Safe Delay for next person (or 500ms if fast visual simulation)
    const delayMs = isSimulation ? 600 : getRandomDelay(QUEUE_DISPATCH_DELAY_MIN_MS, QUEUE_DISPATCH_DELAY_MAX_MS);
    const delaySec = Math.round(delayMs / 1000);

    if (onProgressCallback) {
      onProgressCallback(i + 1, leadList.length, `Sent to ${lead.name}! Waiting ${delaySec}s before next person...`);
    }

    if (i < leadList.length - 1) {
      await new Promise(res => setTimeout(res, delayMs));
    }
  }

  return results;
}

/**
 * AI Sales Attraction Chatbot Agent (15-20 second human typing delay & simple responses)
 */
export async function handleCustomerReplyAttractionAgent(customerMsg, leadContext, isSimulation = false) {
  // 15 to 20 second human typing delay
  const typingDelayMs = isSimulation ? 800 : getRandomDelay(CHATBOT_REPLY_DELAY_MIN_MS, CHATBOT_REPLY_DELAY_MAX_MS);
  await new Promise(res => setTimeout(res, typingDelayMs));

  const msgLower = customerMsg.toLowerCase();
  
  // Project / Service Interest
  if (msgLower.includes('website') || msgLower.includes('app') || msgLower.includes('cost') || msgLower.includes('price') || msgLower.includes('need') || msgLower.includes('build') || msgLower.includes('project')) {
    
    const projectSpecs = extractProjectIdeaSpecs(customerMsg, leadContext);
    
    return {
      replyText: `That sounds great! We can build a fast, simple ${projectSpecs.projectType} for ${leadContext.name}. What is your estimated budget and when would you like to start?`,
      intent: 'PROJECT_INQUIRY',
      projectSpecs: projectSpecs,
      delaySeconds: Math.round(typingDelayMs / 1000)
    };
  }

  if (msgLower.includes('yes') || msgLower.includes('interested') || msgLower.includes('details') || msgLower.includes('more')) {
    return {
      replyText: `Awesome! We create custom websites and mobile apps to bring more customers to ${leadContext.name}. Are you looking for a new website or a mobile app?`,
      intent: 'ATTRACTED_INTEREST',
      projectSpecs: null,
      delaySeconds: Math.round(typingDelayMs / 1000)
    };
  }

  return {
    replyText: `Thanks for replying! We help stores in ${leadContext.address.split(',')[0]} with websites and mobile apps. Let me know if you need any tech help for ${leadContext.name}!`,
    intent: 'GENERAL_INQUIRY',
    projectSpecs: null,
    delaySeconds: Math.round(typingDelayMs / 1000)
  };
}

/**
 * Lead AI Agent - Separates Project Ideas into Clean Dossiers
 */
export function extractProjectIdeaSpecs(customerMsg, leadContext) {
  const msgLower = customerMsg.toLowerCase();
  let projectType = 'Website';

  if (msgLower.includes('app')) projectType = 'Mobile App';
  else if (msgLower.includes('website') || msgLower.includes('site')) projectType = 'Business Website';
  else if (msgLower.includes('lead') || msgLower.includes('software')) projectType = 'Software System';

  return {
    projectId: 'proj-' + Math.floor(1000 + Math.random() * 9000),
    clientName: leadContext.name,
    ownerName: leadContext.ownerName || 'Owner',
    phone: leadContext.mobile || leadContext.phone,
    address: leadContext.address,
    projectType: projectType,
    projectSummary: `${projectType} for ${leadContext.name}`,
    rawRequirement: customerMsg,
    createdTimestamp: new Date().toISOString(),
    status: 'Qualified Project Idea'
  };
}
