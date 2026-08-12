/**
 * 🤖 Advanced AI Message Generator Module for Phase 2 Automation
 * Synthesizes hyper-personalized B2B WhatsApp outreach messages per client/lead.
 * Tailors pitch based on business category, Google rating, location, and owner name.
 */

export const PITCH_ANGLES = {
  TECH_WEB_APP: 'tech_web_app',
  WHATSAPP_AI_BOT: 'whatsapp_ai_bot',
  TEXTILE_EXPORTER: 'textile_exporter',
  LOCAL_SEO_BOOSTER: 'local_seo_booster'
};

export class MessageGenerator {
  constructor(senderName = 'Mukil Arasu', companyName = 'Antigravity AI & Tech Solutions') {
    this.senderName = senderName;
    this.companyName = companyName;
  }

  /**
   * Main entry point to generate pitch for a single lead
   */
  generateAdvertisementPitch(lead, angle = PITCH_ANGLES.TECH_WEB_APP) {
    const owner = lead.ownerName || lead.owner_name || 'Business Owner';
    const ownerFirstName = owner.split(' ')[0] || 'Sir/Maam';
    const shopName = lead.name || lead.business_name || 'your store';
    const category = (lead.category || 'business').toLowerCase();
    const address = lead.address || lead.location || 'Karur, Tamil Nadu';
    const city = address.split(',')[0].trim();
    const rating = lead.rating || lead.user_ratings_total ? `${lead.rating || 4.5}⭐` : null;

    // Detect best auto angle if default
    let selectedAngle = angle;
    if (category.includes('textile') || category.includes('factory') || category.includes('exporter') || category.includes('home textiles')) {
      selectedAngle = PITCH_ANGLES.TEXTILE_EXPORTER;
    } else if (category.includes('hotel') || category.includes('restaurant') || category.includes('lodge')) {
      selectedAngle = PITCH_ANGLES.LOCAL_SEO_BOOSTER;
    } else if (category.includes('gift') || category.includes('toy') || category.includes('cell') || category.includes('mobile')) {
      selectedAngle = PITCH_ANGLES.WHATSAPP_AI_BOT;
    }

    switch (selectedAngle) {
      case PITCH_ANGLES.TEXTILE_EXPORTER:
        return `Vanakkam ${ownerFirstName} Sir! 👋 Greetings from ${this.senderName} at ${this.companyName}.

We help Karur textile manufacturers & exporters digitize their international buyer catalogs, streamline sample requests, and build B2B customer portals for ${shopName}.

Our Karur Textile Tech Solutions:
• 🌐 B2B Export Catalog & Buyer Inquiry Portals
• 📦 Automated Sample Tracking & Quote Generators
• 🤖 24/7 WhatsApp AI Assistant for International Enquiries

Would you be open to a quick 2-minute phone call to see a live demo built for Karur fabric exporters?`;

      case PITCH_ANGLES.WHATSAPP_AI_BOT:
        return `Hi ${ownerFirstName}! 👋 Hope you are having a productive day at ${shopName}.

I'm ${this.senderName} from ${this.companyName}. Noticed ${shopName} in ${city} ${rating ? `(${rating} on Google)` : ''}!

We build Automated WhatsApp 24/7 AI Customer Assistants that automatically answer customer price inquiries, take product bookings, and capture high-intent leads even while your shop is closed.

Key Benefits for ${shopName}:
• 🤖 Zero-delay auto-replies on WhatsApp for price & stock checks
• 📊 Automatic customer phone number lead collection
• ⚡ 3x faster response rate to Google Search customers

Can I share a 1-minute video demo of how our WhatsApp AI bot works?`;

      case PITCH_ANGLES.LOCAL_SEO_BOOSTER:
        return `Vanakkam ${ownerFirstName}! 👋 Greetings from ${this.senderName} (${this.companyName}).

We specialize in boosting local Google search visibility and building online booking & ordering systems for top hospitality businesses like ${shopName} in ${city}.

What we deliver:
• 🌐 Modern fast-loading Web Application & Direct Booking Engine
• 📍 Google Maps SEO & Review Growth Automation
• 📱 WhatsApp Instant Table / Room Reservation Bot

Would you be available for a brief 2-minute chat this week?`;

      case PITCH_ANGLES.TECH_WEB_APP:
      default:
        return `Hi ${ownerFirstName}! 👋 Greetings from ${this.senderName} at ${this.companyName}.

We build custom high-converting web applications, mobile apps, and automated lead generation systems tailored for ${lead.category || 'growing'} businesses like ${shopName} in ${city}.

Our Core Solutions:
• 🌐 Premium Custom Web & E-Commerce Applications
• 📱 Android & iOS Mobile App Development
• 🤖 Automated WhatsApp Lead Capture & Sales Agent

Would you be open to a quick 2-minute chat about expanding ${shopName}'s digital customer reach?`;
    }
  }

  /**
   * Batch process an array of active leads and return updated records with AI pitches
   */
  generateBatchPitches(leads, angle = PITCH_ANGLES.TECH_WEB_APP) {
    return leads.map(lead => {
      const pitch = this.generateAdvertisementPitch(lead, angle);
      return {
        ...lead,
        generatedPitch: pitch,
        pitchTimestamp: new Date().toISOString()
      };
    });
  }
}
