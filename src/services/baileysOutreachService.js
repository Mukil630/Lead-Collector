/**
 * Baileys Safe WhatsApp Checker & Server Queue Dispatcher
 * + AI Sales Attraction Chatbot & Project Idea Extractor Agent
 */

// Simulation of Baileys socket check (onWhatsApp)
export async function checkWhatsAppWithBaileys(phoneStr) {
  const cleanDigits = phoneStr.replace(/[^0-9]/g, '');
  
  // Landlines (04324..., 0431...) do not have WhatsApp
  if (cleanDigits.startsWith('04') || cleanDigits.startsWith('9104')) {
    return { exists: false, jid: null, reason: 'Landline number' };
  }

  // Indian Mobiles starting with 9, 8, 7, 6
  const isMobile = cleanDigits.length >= 10 && ['9', '8', '7', '6'].includes(cleanDigits.slice(-10)[0]);
  
  return {
    exists: isMobile,
    jid: isMobile ? `${cleanDigits}@s.whatsapp.net` : null,
    reason: isMobile ? 'Active WhatsApp Account' : 'Number not registered'
  };
}

/**
 * Server Queue Dispatcher - Sends messages one-by-one safely
 */
export async function dispatchOutreachQueueOneByOne(leadList, messageTemplate, onProgressCallback) {
  const results = [];

  for (let i = 0; i < leadList.length; i++) {
    const lead = leadList[i];
    
    // Step 1: Baileys onWhatsApp check
    const check = await checkWhatsAppWithBaileys(lead.mobile || lead.phone);
    
    if (!check.exists) {
      results.push({
        leadId: lead.id,
        name: lead.name,
        phone: lead.phone,
        status: 'SKIPPED',
        reason: check.reason
      });
      if (onProgressCallback) onProgressCallback(i + 1, leadList.length, `Skipped ${lead.name} (No WhatsApp)`);
      continue;
    }

    // Step 2: Personalized content generation
    const personalizedPitch = messageTemplate
      .replace('{name}', lead.ownerName || lead.name)
      .replace('{business}', lead.name)
      .replace('{category}', lead.category)
      .replace('{address}', lead.address.split(',')[0]);

    // Step 3: Dispatch one by one
    results.push({
      leadId: lead.id,
      name: lead.name,
      phone: lead.phone,
      whatsappJid: check.jid,
      status: 'SENT',
      message: personalizedPitch,
      timestamp: new Date().toISOString()
    });

    if (onProgressCallback) {
      onProgressCallback(i + 1, leadList.length, `Sent to ${lead.name} (${check.jid})`);
    }

    // Safe delay interval between dispatches (500ms in simulation, 5s in production)
    await new Promise(res => setTimeout(res, 400));
  }

  return results;
}

/**
 * AI Sales Chatbot Agent - Client Attraction & Attraction Engine
 */
export function handleCustomerReplyAttractionAgent(customerMsg, leadContext) {
  const msgLower = customerMsg.toLowerCase();
  
  // High Interest / Project Request Detection
  if (msgLower.includes('website') || msgLower.includes('app') || msgLower.includes('project') || msgLower.includes('cost') || msgLower.includes('price') || msgLower.includes('develop') || msgLower.includes('need') || msgLower.includes('build')) {
    
    // Trigger Lead AI Project Extractor Agent
    const projectSpecs = extractProjectIdeaSpecs(customerMsg, leadContext);
    
    return {
      replyText: `Great choice! We specialize in modern web apps, mobile solutions, and digital tools tailored for ${leadContext.category} businesses. I've noted down your project idea: "${projectSpecs.projectSummary}". May I know your estimated budget and target timeline?`,
      intent: 'PROJECT_INQUIRY',
      projectSpecs: projectSpecs
    };
  }

  if (msgLower.includes('yes') || msgLower.includes('interested') || msgLower.includes('tell me more') || msgLower.includes('details')) {
    return {
      replyText: `Wonderful! We provide custom B2B software, e-commerce stores, and local digital lead systems for ${leadContext.category} stores in ${leadContext.address.split(',')[0]}. Would you like to build a new website or upgrade your business software?`,
      intent: 'ATTRACTED_INTEREST',
      projectSpecs: null
    };
  }

  return {
    replyText: `Thank you for reaching out! We help ${leadContext.category} businesses grow with modern web applications and automated lead collectors. Are you planning any new digital project for ${leadContext.name}?`,
    intent: 'GENERAL_INQUIRY',
    projectSpecs: null
  };
}

/**
 * Lead AI Agent - Separates Project Ideas into Structured Dossiers
 */
export function extractProjectIdeaSpecs(customerMsg, leadContext) {
  const msgLower = customerMsg.toLowerCase();
  let projectType = 'Custom B2B Web Application';

  if (msgLower.includes('app')) projectType = 'Mobile Application (Android/iOS)';
  else if (msgLower.includes('website') || msgLower.includes('site')) projectType = 'E-Commerce & Business Website';
  else if (msgLower.includes('lead') || msgLower.includes('scraper')) projectType = 'B2B Lead Collector & CRM System';

  return {
    projectId: 'proj-' + Math.floor(1000 + Math.random() * 9000),
    clientName: leadContext.name,
    ownerName: leadContext.ownerName || 'Managing Director',
    phone: leadContext.mobile || leadContext.phone,
    address: leadContext.address,
    projectType: projectType,
    projectSummary: `Custom ${projectType} tailored for ${leadContext.category} business`,
    rawClientRequirement: customerMsg,
    createdTimestamp: new Date().toISOString(),
    status: 'Qualified Project Prospect'
  };
}
