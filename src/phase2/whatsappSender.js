/**
 * 📌 JS WhatsApp Sender for Phase 2 Automation
 * Dispatches advertisement pitch and transitions status to MESSAGE_SENDING -> MESSAGE_SENT
 */

import { LEAD_STATUS } from './statusManager.js';

export class WhatsAppSender {
  constructor(statusManager) {
    this.statusManager = statusManager;
  }

  async sendMessage(lead, messageText, formattedPhone) {
    // 1. Update status to MESSAGE_SENDING
    this.statusManager.updateStatus(lead.id, LEAD_STATUS.MESSAGE_SENDING, {
      generatedMessage: messageText
    });

    // 2. Build WhatsApp launch URL
    const encodedText = encodeURIComponent(messageText);
    const waUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;

    // 3. Complete dispatch & update status to MESSAGE_SENT
    this.statusManager.updateStatus(lead.id, LEAD_STATUS.MESSAGE_SENT, {
      whatsappUrl: waUrl,
      sentTimestamp: new Date().toISOString(),
      outreachChannel: 'WHATSAPP'
    });

    return {
      leadId: lead.id,
      businessName: lead.name || lead.business_name,
      status: LEAD_STATUS.MESSAGE_SENT,
      waUrl,
      messageText
    };
  }
}
