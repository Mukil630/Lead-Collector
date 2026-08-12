"""
🤖 Backend AI Ad Prompt Agent Module (phase2/ai_ad_prompt_agent.py)
Company: Vizro Vertex Software Solution
Pitch Architecture: Shop Name ➔ Problem Inquiry ➔ Solution Readiness ➔ Core Services ➔ 'Are you interested?'
"""

class AIAdPromptAgent:
    def __init__(self, agency_name="Vizro Vertex Software Solution", sender_name="Mukil Arasu"):
        self.agency_name = agency_name
        self.sender_name = sender_name

    def generate_ad_prompt_and_message(self, shop):
        shop_name = shop.get("name") or shop.get("business_name") or "your business"
        category = shop.get("category") or "business"
        owner_name = (shop.get("ownerName") or shop.get("owner_name") or "Sir/Maam").split()[0]
        address = shop.get("address") or shop.get("location") or "Karur, Tamil Nadu"
        city = address.split(',')[0].strip()

        system_prompt = (
            f"You are a B2B AI Business Consultant for {self.agency_name}. Write a polite, neat, high-converting "
            f"WhatsApp message for {owner_name}, owner of '{shop_name}' ({category}) in {city}. Ask about their business "
            f"challenges, introduce {self.agency_name}, list services (Mobile Apps, Websites, Automation, AI Agents), and ask if they are interested."
        )

        ad_message = (
            f"Vanakkam {owner_name}! 👋 Hope you are having a great day at {shop_name}.\n\n"
            f"Are you currently facing any challenges or bottlenecks with managing {shop_name}, getting more local customers, or handling daily shop operations?\n\n"
            f"We at {self.agency_name} are ready to help you! ⚡\n\n"
            f"We provide custom software solutions tailored for {category} businesses:\n"
            f"• 📱 Mobile Apps (Android & iOS)\n"
            f"• 🌐 Modern Websites & E-Commerce Catalogs\n"
            f"• ⚙️ Business Process Automation\n"
            f"• 🤖 24/7 AI Sales & Customer Support Agents\n\n"
            f"Are you interested in discussing your software requirements?\n\n"
            f"Thank you,\n"
            f"{self.sender_name} | {self.agency_name}"
        )

        return {
            "shop_id": shop.get("id"),
            "shop_name": shop_name,
            "category": category,
            "owner_name": owner_name,
            "phone": shop.get("mobile") or shop.get("phone"),
            "angle": "VIZRO_VERTEX_PITCH",
            "system_prompt": system_prompt,
            "tailored_whatsapp_ad": ad_message
        }

    def process_all_100_shops(self, shops_list):
        return [self.generate_ad_prompt_and_message(shop) for shop in shops_list]
