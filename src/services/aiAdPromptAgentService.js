/**
 * 🤖 Frontend AI Ad Prompt Agent Service (src/services/aiAdPromptAgentService.js)
 * Company: Vizro Vertex Software Solution
 * Pitch Architecture: Shop Name ➔ Problem Inquiry ➔ Solution Readiness ➔ Core Services ➔ 'Are you interested?'
 */

export class AIAdPromptAgentService {
  constructor(agencyName = 'Vizro Vertex Software Solution', senderName = 'Mukil Arasu') {
    this.agencyName = agencyName;
    this.senderName = senderName;
  }

  generateAdPromptAndMessage(shop) {
    const shopName = shop.name || shop.business_name || 'your business';
    const category = shop.category || 'business';
    const ownerName = (shop.ownerName || shop.owner_name || 'Sir/Maam').split(' ')[0];
    const address = shop.address || shop.location || 'Karur, Tamil Nadu';
    const city = address.split(',')[0].trim();

    const systemPrompt = `You are a B2B AI Business Consultant for ${this.agencyName}. Write a polite, neat, high-converting WhatsApp message for ${ownerName}, owner of '${shopName}' (${category}) in ${city}. Ask about their business challenges, introduce ${this.agencyName}, list services (Mobile Apps, Websites, Automation, AI Agents), and ask if they are interested.`;

    const adMessage = `Vanakkam ${ownerName}! 👋 Hope you are having a great day at ${shopName}.

Are you currently facing any challenges or bottlenecks with managing ${shopName}, getting more local customers, or handling daily shop operations?

We at ${this.agencyName} are ready to help you! ⚡

We provide custom software solutions tailored for ${category} businesses:
• 📱 Mobile Apps (Android & iOS)
• 🌐 Modern Websites & E-Commerce Catalogs
• ⚙️ Business Process Automation
• 🤖 24/7 AI Sales & Customer Support Agents

Are you interested in discussing your software requirements?

Thank you,
${this.senderName} | ${this.agencyName}`;

    const phone = shop.mobile || shop.phone || '';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    return {
      id: shop.id,
      shopName: shopName,
      category: category,
      ownerName: ownerName,
      phone: phone,
      whatsappLink: `https://wa.me/${cleanPhone}?text=${encodeURIComponent(adMessage)}`,
      angle: 'VIZRO_VERTEX_PITCH',
      systemPrompt: systemPrompt,
      tailoredAdMessage: adMessage
    };
  }

  processAll100Shops(shopsList) {
    return shopsList.map(shop => this.generateAdPromptAndMessage(shop));
  }
}
