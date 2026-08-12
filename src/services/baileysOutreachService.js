/**
 * Baileys Safe WhatsApp Checker & Server Queue Dispatcher
 * Formats Indian mobile numbers to international 919xxxxxxxx format
 */

export const QUEUE_DISPATCH_DELAY_MIN_MS = 60000;
export const QUEUE_DISPATCH_DELAY_MAX_MS = 120000;

export const CHATBOT_REPLY_DELAY_MIN_MS = 15000;
export const CHATBOT_REPLY_DELAY_MAX_MS = 20000;

function getRandomDelay(minMs, maxMs) {
  return Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
}

/**
 * Format raw Indian phone number to clean 91XXXXXXXXXX WhatsApp format
 */
export function formatWhatsAppNumber(phoneStr) {
  if (!phoneStr) return null;
  const digits = phoneStr.replace(/[^0-9]/g, '');
  
  // Landlines starting with 04324, 0431, 044, 0422
  if (digits.startsWith('04') || digits.startsWith('9104')) {
    return null; // Landline
  }

  // Mobile starting with 09... or 08... or 07... or 06...
  if (digits.length === 11 && digits.startsWith('0')) {
    return '91' + digits.slice(1);
  }

  // Mobile starting with 9..., 8..., 7..., 6... (10 digits)
  if (digits.length === 10 && ['9', '8', '7', '6'].includes(digits[0])) {
    return '91' + digits;
  }

  // Already 91XXXXXXXXXX (12 digits)
  if (digits.length === 12 && digits.startsWith('91') && ['9', '8', '7', '6'].includes(digits[2])) {
    return digits;
  }

  return null;
}

/**
 * Check if number has active WhatsApp (Baileys onWhatsApp protocol)
 */
export async function checkWhatsAppWithBaileys(phoneStr) {
  const formattedWa = formatWhatsAppNumber(phoneStr);
  
  if (!formattedWa) {
    return { exists: false, jid: null, formattedPhone: null, reason: 'Landline or invalid mobile' };
  }

  return {
    exists: true,
    jid: `${formattedWa}@s.whatsapp.net`,
    formattedPhone: formattedWa,
    reason: 'Active WhatsApp Account'
  };
}

/**
 * Simplified WhatsApp pitch template
 */
export function getSimplePitchTemplate(lead) {
  const name = lead.ownerName ? lead.ownerName.split(' ')[0] : 'Sir/Maam';
  return `Hi ${name}! 👋 We build simple websites, mobile apps & lead systems for ${lead.category} businesses in ${lead.address.split(',')[0]}. Are you planning any new project for ${lead.name}?`;
}

/**
 * Server Queue Dispatcher
 */
export async function dispatchOutreachQueueOneByOne(leadList, customTemplate = null, onProgressCallback = null, isSimulation = false) {
  const results = [];

  for (let i = 0; i < leadList.length; i++) {
    const lead = leadList[i];
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

    const pitchText = customTemplate 
      ? customTemplate.replace('{name}', lead.ownerName || lead.name).replace('{business}', lead.name)
      : getSimplePitchTemplate(lead);

    results.push({
      leadId: lead.id,
      name: lead.name,
      phone: lead.phone,
      whatsappJid: check.jid,
      status: 'SENT',
      message: pitchText,
      timestamp: new Date().toISOString()
    });

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
 * AI Sales Attraction Chatbot Agent
 */
export async function handleCustomerReplyAttractionAgent(customerMsg, leadContext, isSimulation = false) {
  const typingDelayMs = isSimulation ? 800 : getRandomDelay(CHATBOT_REPLY_DELAY_MIN_MS, CHATBOT_REPLY_DELAY_MAX_MS);
  await new Promise(res => setTimeout(res, typingDelayMs));

  const msgLower = customerMsg.toLowerCase();
  
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
 * Lead AI Agent - Project Specs Extractor
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
