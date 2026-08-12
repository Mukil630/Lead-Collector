"""
📌 Advanced AI Message Generator Module for Phase 2 Python Engine
Synthesizes hyper-personalized B2B WhatsApp outreach messages per client/lead.
Tailors pitch based on business category, Google rating, location, and owner name.
"""

class MessageGenerator:
    def __init__(self, sender_name="Mukil Arasu", company_name="Antigravity Tech Solutions"):
        self.sender_name = sender_name
        self.company_name = company_name

    def generate_advertisement_pitch(self, lead, angle="tech_web_app"):
        business_name = lead.get("business_name") or lead.get("name") or "your business"
        location = (lead.get("location") or lead.get("address") or "Karur").split(',')[0].strip()
        category = (lead.get("category") or "store").lower()
        owner_name = lead.get("owner_name") or lead.get("ownerName") or "Sir/Maam"
        rating = lead.get("rating")
        
        if " " in owner_name:
            owner_name = owner_name.split()[0]

        # Auto-detect category angle
        if any(k in category for k in ["textile", "factory", "exporter", "fabric"]):
            return (
                f"Vanakkam {owner_name} Sir! 👋 Greetings from {self.sender_name} at {self.company_name}.\n\n"
                f"We help Karur textile manufacturers & exporters digitize their international buyer catalogs, "
                f"streamline sample requests, and build B2B customer portals for {business_name}.\n\n"
                f"Our Karur Textile Tech Solutions:\n"
                f"• 🌐 B2B Export Catalog & Buyer Inquiry Portals\n"
                f"• 📦 Automated Sample Tracking & Quote Generators\n"
                f"• 🤖 24/7 WhatsApp AI Assistant for International Enquiries\n\n"
                f"Would you be open to a quick 2-minute phone call to see a live demo built for Karur fabric exporters?"
            )
        elif any(k in category for k in ["gift", "toy", "cell", "mobile", "boutique"]):
            return (
                f"Hi {owner_name}! 👋 Hope you are having a productive day at {business_name}.\n\n"
                f"I'm {self.sender_name} from {self.company_name}. Noticed {business_name} in {location}!\n\n"
                f"We build Automated WhatsApp 24/7 AI Customer Assistants that automatically answer customer price inquiries, "
                f"take product bookings, and capture high-intent leads even while your shop is closed.\n\n"
                f"Key Benefits for {business_name}:\n"
                f"• 🤖 Zero-delay auto-replies on WhatsApp for price & stock checks\n"
                f"• 📊 Automatic customer phone number lead collection\n"
                f"• ⚡ 3x faster response rate to Google Search customers\n\n"
                f"Can I share a 1-minute video demo of how our WhatsApp AI bot works?"
            )
        elif any(k in category for k in ["hotel", "restaurant", "lodge"]):
            return (
                f"Vanakkam {owner_name}! 👋 Greetings from {self.sender_name} ({self.company_name}).\n\n"
                f"We specialize in boosting local Google search visibility and building online booking & ordering systems "
                f"for top hospitality businesses like {business_name} in {location}.\n\n"
                f"What we deliver:\n"
                f"• 🌐 Modern Fast Web Application & Direct Booking Engine\n"
                f"• 📍 Google Maps SEO & Review Growth Automation\n"
                f"• 📱 WhatsApp Instant Table / Room Reservation Bot\n\n"
                f"Would you be available for a brief 2-minute chat this week?"
            )
        else:
            return (
                f"Hi {owner_name}! 👋 Greetings from {self.sender_name} at {self.company_name}.\n\n"
                f"We build custom B2B web applications, mobile apps, and automated lead generation systems "
                f"tailored for businesses like {business_name} in {location}.\n\n"
                f"Our Core Solutions:\n"
                f"• 🌐 Premium Custom Web & E-Commerce Applications\n"
                f"• 📱 Android & iOS Mobile App Development\n"
                f"• 🤖 Automated WhatsApp Lead Capture & Sales Agent\n\n"
                f"Would you be open to a quick 2-minute chat about expanding {business_name}'s digital customer reach?"
            )

    def generate_batch_pitches(self, leads):
        for lead in leads:
            lead["generated_pitch"] = self.generate_advertisement_pitch(lead)
        return leads
