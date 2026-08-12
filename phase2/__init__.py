"""
Phase 2 Modular Package for B2B Lead Automation
"""
from phase2.status_manager import StatusManager, LeadStatus
from phase2.lead_fetcher import LeadFetcher
from phase2.whatsapp_checker import WhatsAppChecker
from phase2.message_generator import MessageGenerator
from phase2.whatsapp_sender import WhatsAppSender
from phase2.campaign_manager import CampaignManager

__all__ = [
    "StatusManager",
    "LeadStatus",
    "LeadFetcher",
    "WhatsAppChecker",
    "MessageGenerator",
    "WhatsAppSender",
    "CampaignManager"
]
