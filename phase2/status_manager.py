"""
📌 Status Manager Module for Phase 2 Automation
Manages database lead status transitions:
NEW -> CHECKING_WHATSAPP -> (WHATSAPP_AVAILABLE | WHATSAPP_NOT_FOUND) -> MESSAGE_SENDING -> MESSAGE_SENT
"""

class LeadStatus:
    NEW = "NEW"
    CHECKING_WHATSAPP = "CHECKING_WHATSAPP"
    WHATSAPP_AVAILABLE = "WHATSAPP_AVAILABLE"
    WHATSAPP_NOT_FOUND = "WHATSAPP_NOT_FOUND"
    MESSAGE_SENDING = "MESSAGE_SENDING"
    MESSAGE_SENT = "MESSAGE_SENT"

class StatusManager:
    def __init__(self, db_records=None):
        self.db = db_records if db_records is not None else []
        self.history_logs = []

    def set_database(self, db_records):
        self.db = db_records

    def update_status(self, lead_id, new_status, metadata=None):
        for lead in self.db:
            if lead.get("id") == lead_id or lead.get("phone_number") == lead_id:
                old_status = lead.get("status", LeadStatus.NEW)
                lead["status"] = new_status
                if metadata:
                    lead.update(metadata)
                
                log_entry = f"Lead [{lead.get('business_name')}]: Status changed from '{old_status}' -> '{new_status}'"
                self.history_logs.append(log_entry)
                return lead
        return None

    def get_leads_by_status(self, status):
        return [lead for lead in self.db if lead.get("status") == status]
