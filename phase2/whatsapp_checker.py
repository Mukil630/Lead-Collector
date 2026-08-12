"""
📌 WhatsApp Checker Module for Phase 2
Validates phone numbers for WhatsApp eligibility & updates status
"""

import re
from phase2.status_manager import LeadStatus

class WhatsAppChecker:
    def __init__(self, status_manager):
        self.status_manager = status_manager

    def format_phone(self, phone_str):
        if not phone_str:
            return None
        digits = re.sub(r'[^0-9]', '', str(phone_str))
        
        # Check landline prefixes
        if digits.startswith('04') or digits.startswith('9104'):
            return None # Landline
            
        if len(digits) == 11 and digits.startswith('0'):
            return '91' + digits[1:]
            
        if len(digits) == 10 and digits[0] in ['9', '8', '7', '6']:
            return '91' + digits
            
        if len(digits) == 12 and digits.startswith('91') and digits[2] in ['9', '8', '7', '6']:
            return digits
            
        return None

    def check_whatsapp_eligibility(self, lead):
        phone = lead.get("phone_number") or lead.get("mobile") or lead.get("phone")
        formatted = self.format_phone(phone)
        
        if not formatted:
            # WhatsApp Not Found / Landline
            self.status_manager.update_status(
                lead.get("id"), 
                LeadStatus.WHATSAPP_NOT_FOUND, 
                {"whatsapp_eligible": False, "reason": "Landline or Invalid Number"}
            )
            return {"eligible": False, "lead": lead, "formatted_phone": None}
            
        # WhatsApp Available
        jid = f"{formatted}@s.whatsapp.net"
        self.status_manager.update_status(
            lead.get("id"), 
            LeadStatus.WHATSAPP_AVAILABLE, 
            {"whatsapp_eligible": True, "whatsapp_jid": jid, "formatted_phone": formatted}
        )
        return {"eligible": True, "lead": lead, "formatted_phone": formatted, "jid": jid}
