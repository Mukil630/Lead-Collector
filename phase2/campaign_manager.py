"""
📌 Campaign Manager Module for Phase 2
Orchestrates the execution pipeline:
Lead Fetcher ➔ WhatsApp Checker ➔ Message Generator ➔ WhatsApp Sender ➔ Status Manager
"""

from phase2.status_manager import StatusManager, LeadStatus
from phase2.lead_fetcher import LeadFetcher
from phase2.whatsapp_checker import WhatsAppChecker
from phase2.message_generator import MessageGenerator
from phase2.whatsapp_sender import WhatsAppSender

class CampaignManager:
    def __init__(self, db_records=None, sender_name="Mukil Arasu", company_name="Antigravity Tech Solutions"):
        self.status_manager = StatusManager(db_records)
        self.lead_fetcher = LeadFetcher(self.status_manager)
        self.whatsapp_checker = WhatsAppChecker(self.status_manager)
        self.message_generator = MessageGenerator(sender_name, company_name)
        self.whatsapp_sender = WhatsAppSender(self.status_manager)

    def run_phase2_pipeline(self, callback=None):
        """
        Executes Phase 2 Pipeline step-by-step
        """
        results = {
            "fetched_count": 0,
            "whatsapp_available_count": 0,
            "whatsapp_not_found_count": 0,
            "messages_sent_count": 0,
            "details": []
        }

        # Step 1: Lead Fetcher (Get status == 'NEW')
        new_leads = self.lead_fetcher.fetch_new_leads()
        results["fetched_count"] = len(new_leads)

        if callback:
            callback("LEAD_FETCHER", f"Fetched {len(new_leads)} new leads from database", {"leads": new_leads})

        # Process each lead through the modular pipeline
        for lead in new_leads:
            business_name = lead.get("business_name") or lead.get("name")
            
            # Step 2: WhatsApp Checker
            check_res = self.whatsapp_checker.check_whatsapp_eligibility(lead)
            
            if callback:
                callback("WHATSAPP_CHECKER", f"Checked WhatsApp for {business_name}", check_res)

            if not check_res["eligible"]:
                results["whatsapp_not_found_count"] += 1
                results["details"].append({
                    "business_name": business_name,
                    "status": LeadStatus.WHATSAPP_NOT_FOUND,
                    "reason": "Landline / Invalid Number"
                })
                continue

            results["whatsapp_available_count"] += 1

            # Step 3: Message Generator
            msg = self.message_generator.generate_advertisement_pitch(lead)
            if callback:
                callback("MESSAGE_GENERATOR", f"Generated advertisement pitch for {business_name}", {"message": msg})

            # Step 4: WhatsApp Sender & Status Manager
            send_res = self.whatsapp_sender.send_message(lead, msg, check_res["formatted_phone"])
            results["messages_sent_count"] += 1
            results["details"].append(send_res)

            if callback:
                callback("WHATSAPP_SENDER", f"Sent WhatsApp advertisement to {business_name}", send_res)

        return results
