/**
 * 🤖 AI Content Generator Engine for Personalized WhatsApp Ads
 * Company: Vizro Vertex Software Solution
 * Pitch Architecture: Shop Name ➔ Problem Inquiry ➔ Solution Readiness ➔ Core Services ➔ 'Are you interested?'
 */

export const AD_STYLES = {
  VIZRO_VERTEX: 'vizro_vertex',
  SIMPLE_FRIENDLY: 'simple_friendly',
  HIGH_IMPACT_EMOJI: 'high_impact_emoji',
  SHORT_DIRECT: 'short_direct'
};

export class AIAdContentGenerator {
  constructor(companyName = 'Vizro Vertex Software Solution', senderName = 'Mukil Arasu') {
    this.companyName = companyName;
    this.senderName = senderName;
  }

  generatePersonalizedAd(lead, style = AD_STYLES.VIZRO_VERTEX) {
    const shopName = lead.name || lead.business_name || 'your business';
    const category = lead.category || 'business';
    const ownerName = (lead.ownerName || lead.owner_name || 'Sir/Maam').split(' ')[0];
    const address = lead.address || lead.location || 'Karur, Tamil Nadu';
    const city = address.split(',')[0].trim();

    return `Vanakkam ${ownerName}! 👋 Hope you are having a great day at ${shopName}.

Are you currently facing any challenges or bottlenecks with managing ${shopName}, getting more local customers, or handling daily shop operations?

We at ${this.companyName} are ready to help you! ⚡

We provide custom software solutions tailored for ${category} businesses:
• 📱 Mobile Apps (Android & iOS)
• 🌐 Modern Websites & E-Commerce Catalogs
• ⚙️ Business Process Automation
• 🤖 24/7 AI Sales & Customer Support Agents

Are you interested in discussing your software requirements?

Thank you,
${this.senderName} | ${this.companyName}`;
  }

  generateBatchAds(leadsList, style = AD_STYLES.VIZRO_VERTEX) {
    return leadsList.map(lead => {
      const formattedPhone = lead.mobile || lead.phone || '';
      const adMessage = this.generatePersonalizedAd(lead, style);
      const encodedMsg = encodeURIComponent(adMessage);

      return {
        leadId: lead.id,
        shopName: lead.name || lead.business_name,
        category: lead.category,
        ownerName: lead.ownerName || lead.owner_name,
        phone: formattedPhone,
        whatsappLink: `https://wa.me/${formattedPhone.replace(/[^0-9]/g, '')}?text=${encodedMsg}`,
        personalizedAd: adMessage,
        generatedAt: new Date().toISOString()
      };
    });
  }
}
