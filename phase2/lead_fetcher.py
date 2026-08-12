"""
📌 Lead Fetcher Module for Phase 2
Fetches leads from the Lead Database where status == 'NEW'
and transitions them to 'CHECKING_WHATSAPP'
"""

from phase2.status_manager import LeadStatus

class LeadFetcher:
    def __init__(self, status_manager):
        self.status_manager = status_manager

    def fetch_new_leads(self):
        """Query DB for leads where status == 'NEW'"""
        new_leads = self.status_manager.get_leads_by_status(LeadStatus.NEW)
        
        # Also include leads without explicit status field as NEW
        for lead in self.status_manager.db:
            if "status" not in lead or lead.get("status") is None:
                lead["status"] = LeadStatus.NEW
                if lead not in new_leads:
                    new_leads.append(lead)

        # Transition status to CHECKING_WHATSAPP
        for lead in new_leads:
            self.status_manager.update_status(lead.get("id"), LeadStatus.CHECKING_WHATSAPP)
            
        return new_leads
