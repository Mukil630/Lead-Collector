/**
 * 📌 JS Lead Fetcher for Phase 2 Automation
 * Queries database for leads where status == "NEW"
 * Transitions lead status to CHECKING_WHATSAPP
 */

import { LEAD_STATUS } from './statusManager.js';

export class LeadFetcher {
  constructor(statusManager) {
    this.statusManager = statusManager;
  }

  fetchNewLeads() {
    const newLeads = this.statusManager.db.filter(l => !l.status || l.status === LEAD_STATUS.NEW);

    newLeads.forEach(lead => {
      this.statusManager.updateStatus(lead.id, LEAD_STATUS.CHECKING_WHATSAPP);
    });

    return newLeads;
  }
}
