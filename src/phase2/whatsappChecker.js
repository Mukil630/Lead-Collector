/**
 * 📌 JS WhatsApp Checker for Phase 2 Automation
 * Validates phone numbers using Baileys socket check logic
 * Updates status to WHATSAPP_AVAILABLE or WHATSAPP_NOT_FOUND
 */

import { LEAD_STATUS } from './statusManager.js';
import { checkWhatsAppWithBaileys } from '../services/baileysOutreachService.js';

export class WhatsAppChecker {
  constructor(statusManager) {
    this.statusManager = statusManager;
  }

  async checkWhatsAppEligibility(lead) {
    const phone = lead.mobile || lead.phone || lead.phone_number;
    const res = await checkWhatsAppWithBaileys(phone);

    if (!res.exists) {
      this.statusManager.updateStatus(lead.id, LEAD_STATUS.WHATSAPP_NOT_FOUND, {
        whatsappEligible: false,
        whatsappReason: res.reason
      });
      return { eligible: false, lead, jid: null, reason: res.reason };
    }

    this.statusManager.updateStatus(lead.id, LEAD_STATUS.WHATSAPP_AVAILABLE, {
      whatsappEligible: true,
      whatsappJid: res.jid,
      formattedPhone: res.formattedPhone
    });
    return { eligible: true, lead, jid: res.jid, formattedPhone: res.formattedPhone };
  }
}
