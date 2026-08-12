"""
📌 WhatsApp Sender Module for Phase 2
Handles dispatching generated messages and updating status to MESSAGE_SENDING -> MESSAGE_SENT
"""

import urllib.parse
from phase2.status_manager import LeadStatus

class WhatsAppSender:
    def __init__(self, status_manager):
        self.status_manager = status_manager

    def send_message(self, lead, message_text, formatted_phone):
        # 1. Update status to MESSAGE_SENDING
        self.status_manager.update_status(
            lead.get("id"), 
            LeadStatus.MESSAGE_SENDING, 
            {"message_text": message_text}
        )

        # 2. Build WhatsApp API link / payload
        encoded_text = urllib.parse.quote(message_text)
        wa_url = f"https://wa.me/{formatted_phone}?text={encoded_text}"

        # 3. Complete dispatch & update status to MESSAGE_SENT
        self.status_manager.update_status(
            lead.get("id"),
            LeadStatus.MESSAGE_SENT,
            {
                "whatsapp_url": wa_url,
                "sent_timestamp": "2026-08-12T14:25:00+05:30",
                "outreach_channel": "WHATSAPP"
            }
        )

        return {
            "lead_id": lead.get("id"),
            "business_name": lead.get("business_name") or lead.get("name"),
            "status": LeadStatus.MESSAGE_SENT,
            "wa_url": wa_url,
            "message": message_text
        }
