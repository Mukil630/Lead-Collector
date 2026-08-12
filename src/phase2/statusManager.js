/**
 * 📌 JS Status Manager for Phase 2 Automation
 * Lead Database Status Lifecycle:
 * NEW -> CHECKING_WHATSAPP -> (WHATSAPP_AVAILABLE | WHATSAPP_NOT_FOUND) -> MESSAGE_SENDING -> MESSAGE_SENT
 */

export const LEAD_STATUS = {
  NEW: 'NEW',
  CHECKING_WHATSAPP: 'CHECKING_WHATSAPP',
  WHATSAPP_AVAILABLE: 'WHATSAPP_AVAILABLE',
  WHATSAPP_NOT_FOUND: 'WHATSAPP_NOT_FOUND',
  MESSAGE_SENDING: 'MESSAGE_SENDING',
  MESSAGE_SENT: 'MESSAGE_SENT'
};

export class StatusManager {
  constructor(dbRecords = []) {
    this.db = dbRecords;
    this.historyLogs = [];
  }

  setDatabase(dbRecords) {
    this.db = dbRecords;
  }

  updateStatus(leadId, newStatus, metadata = {}) {
    const lead = this.db.find(l => l.id === leadId || l.mobile === leadId || l.phone === leadId);
    if (lead) {
      const oldStatus = lead.status || LEAD_STATUS.NEW;
      lead.status = newStatus;
      Object.assign(lead, metadata);
      
      const logEntry = `Lead [${lead.name || lead.business_name}]: Status changed from '${oldStatus}' -> '${newStatus}'`;
      this.historyLogs.push(logEntry);
      return lead;
    }
    return null;
  }

  getLeadsByStatus(status) {
    return this.db.filter(l => (l.status || LEAD_STATUS.NEW) === status);
  }
}
