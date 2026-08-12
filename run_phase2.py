"""
Phase 2 Pipeline Runner Script
Executes Phase 2 B2B WhatsApp Campaign Automation
"""

import sys
import io

# Ensure UTF-8 output for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from phase2.campaign_manager import CampaignManager

# Sample Phase 1 Collected Leads
sample_leads = [
    {
        "id": "lead-01",
        "business_name": "Minister White - Karur",
        "phone_number": "094433 26133",
        "location": "Old Coimbatore Rd, Karur, Tamil Nadu 639001",
        "email": "contact@ministerwhitekarur.com",
        "source": "Google Maps Collector",
        "category": "Men's Clothes Shop",
        "owner_name": "Subramanian Raj",
        "status": "NEW"
    },
    {
        "id": "lead-02",
        "business_name": "POPULAR & CO GIFT & TOY SHOP",
        "phone_number": "098948 67786",
        "location": "Jawahar Bazaar Rd, Karur, Tamil Nadu 639001",
        "email": "contact@popularcogifttoyshop.com",
        "source": "Google Maps Collector",
        "category": "Gift Shop",
        "owner_name": "Sundaram K",
        "status": "NEW"
    },
    {
        "id": "lead-03",
        "business_name": "Karur Landline Office",
        "phone_number": "04324 261333",
        "location": "Jawahar Bazaar Rd, Karur, Tamil Nadu 639001",
        "email": "office@karurlandline.com",
        "source": "Google Maps Collector",
        "category": "Office",
        "owner_name": "Office Admin",
        "status": "NEW"
    }
]

def on_step_executed(node_name, description, payload):
    print(f"➜ [{node_name}]: {description}")

def main():
    print("=" * 60)
    print("⚡ RUNNING PHASE 2 CAMPAIGN PIPELINE")
    print("=" * 60)

    manager = CampaignManager(sample_leads, sender_name="Mukil Arasu", company_name="Antigravity AI")
    summary = manager.run_phase2_pipeline(callback=on_step_executed)

    print("\n" + "=" * 60)
    print("📊 PHASE 2 EXECUTION SUMMARY")
    print("=" * 60)
    print(f"Leads Fetched (NEW)      : {summary['fetched_count']}")
    print(f"WhatsApp Available (YES) : {summary['whatsapp_available_count']}")
    print(f"WhatsApp Not Found (NO)  : {summary['whatsapp_not_found_count']}")
    print(f"Messages Sent            : {summary['messages_sent_count']}")

if __name__ == "__main__":
    main()
