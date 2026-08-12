/**
 * 🚦 INTENT ROUTER & STRUCTURED STATE CLASSIFIER (server/ai/intentRouter.js)
 * Produces structured state: intent, business_type, project_type, features, lead_stage, language, needs_human.
 */

export function routeUserIntent(userMessage, session) {
  const lower = (userMessage || '').trim().toLowerCase();

  // 1. Business Type Extractor
  const businessTypes = ['bakery', 'boutique', 'clinic', 'hospital', 'restaurant', 'cafe', 'school', 'college', 'shop', 'store', 'salon', 'real estate', 'car wash', 'gym'];
  const foundType = businessTypes.find(b => lower.includes(b));
  if (foundType) {
    session.business_type = foundType.charAt(0).toUpperCase() + foundType.slice(1);
  }

  // 2. Project Type Extractor
  if (lower.includes('website') || lower.includes('site') || lower.includes('e-commerce') || lower.includes('web app')) {
    session.project_type = 'Full-Stack Web App';
  } else if (lower.includes('mobile app') || lower.includes('android') || lower.includes('ios') || lower === 'app') {
    session.project_type = 'Mobile App';
  } else if (lower.includes('bot') || lower.includes('whatsapp') || lower.includes('ai agent')) {
    session.project_type = 'WhatsApp AI Bot';
  } else if (lower.includes('pos') || lower.includes('billing')) {
    session.project_type = 'POS Billing System';
  }

  // 3. Feature Extractor
  const featureKeywords = [
    { key: 'Online Ordering', tokens: ['ordering', 'order online', 'catalog'] },
    { key: 'UPI Payment QR', tokens: ['upi', 'qr', 'payment'] },
    { key: 'Thermal Printing', tokens: ['thermal', 'printer', 'receipt'] },
    { key: 'Attendance Tracking', tokens: ['attendance', 'fees'] },
    { key: 'Reels Editing', tokens: ['reels', 'instagram', 'banners'] }
  ];

  featureKeywords.forEach(item => {
    if (item.tokens.some(t => lower.includes(t))) {
      if (!session.features.includes(item.key)) {
        session.features.push(item.key);
      }
    }
  });

  // 4. Intent & Workflow Routing
  let intent = 'RAG_KNOWLEDGE';
  let stage = session.lead_stage;
  let needsHuman = false;

  if (lower.includes('talk to mukil') || lower.includes('speak to founder') || lower.includes('human') || lower.includes('contact mukil')) {
    intent = 'HUMAN_HANDOFF';
    stage = 'HUMAN_HANDOFF';
    needsHuman = true;
  } else if (lower.includes('order') || lower.includes('online ordering') || (session.business_type && session.project_type && session.features.length > 0)) {
    intent = 'REQUIREMENT_COLLECTION';
    stage = 'QUALIFIED_LEAD';
  } else if (foundType || (session.business_type && (lower.includes('project') || lower.includes('solution') || lower.includes('recommend')))) {
    intent = 'SOLUTION_RECOMMENDATION';
    stage = 'SOLUTION_RECOMMENDATION';
  } else if (lower.includes('price') || lower.includes('cost') || lower.includes('rate') || lower.includes('evlo') || lower.includes('how much')) {
    intent = 'PRICING_QUESTION';
    stage = 'INTERESTED';
  } else {
    intent = 'RAG_KNOWLEDGE';
    stage = session.lead_stage === 'NEW' ? 'GREETING' : session.lead_stage;
  }

  session.current_intent = intent;
  session.lead_stage = stage;

  return {
    intent,
    leadStage: stage,
    businessType: session.business_type,
    projectType: session.project_type,
    extractedFeatures: session.features,
    needsHuman: needsHuman
  };
}
