"""
🤖 AI Content Generator Module for Backend Execution Pipeline
Google Maps ➔ Lead Number ➔ Shop Name ➔ 🤖 AI Content Generator ➔ Personalized WhatsApp Ad ➔ Send Message
"""

class AIAdContentGenerator:
    def __init__(self, company_name="Antigravity AI", sender_name="Mukil Arasu"):
        self.company_name = company_name
        self.sender_name = sender_name

    def generate_personalized_ad(self, lead, style="simple_friendly"):
        shop_name = lead.get("business_name") or lead.get("name") or "your business"
        category = lead.get("category") or "store"
        owner_name = (lead.get("owner_name") or lead.get("ownerName") or "Sir/Maam").split()[0]
        location = (lead.get("location") or lead.get("address") or "Karur").split(',')[0].strip()

        if style == "high_impact_emoji":
            return (
                f"Hi {owner_name}! 👋\n\n"
                f"Greetings from {self.sender_name} at {self.company_name}! ⚡\n\n"
                f"Noticed {shop_name} in {location}! We specialize in helping {category} stores grow customer reach with simple tech solutions.\n\n"
                f"🚀 What we build for {shop_name}:\n"
                f"• 🌐 Custom Fast Web Applications & Online Catalogs\n"
                f"• 📱 Android & iOS Mobile Apps\n"
                f"• 🤖 24/7 WhatsApp AI Customer Support Assistant\n\n"
                f"Would you like a quick 1-minute video demo of how it works for {shop_name}?"
            )
        else:
            return (
                f"Hi {owner_name}! 👋 Hope you are having a great day at {shop_name}.\n\n"
                f"I'm {self.sender_name} from {self.company_name}. We build simple, high-converting websites, mobile apps, "
                f"and WhatsApp AI bots tailored for {category} businesses like {shop_name} in {location}.\n\n"
                f"Key Benefits:\n"
                f"• 🌐 Modern Web Catalog for {shop_name}\n"
                f"• 🤖 24/7 WhatsApp Lead Capture & Auto-Reply\n"
                f"• 📱 Fast & Mobile Friendly\n\n"
                f"Would you be open to a quick 2-minute call to discuss your software requirements?"
            )

    def generate_batch_ads(self, leads):
        results = []
        for lead in leads:
            ad = self.generate_personalized_ad(lead)
            results.append({
                "shop_name": lead.get("business_name") or lead.get("name"),
                "phone": lead.get("phone_number") or lead.get("phone"),
                "personalized_ad": ad
            })
        return results
