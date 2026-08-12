"""
🧠 Python Groq AI RAG Sales Agent Module (phase2/groq_sales_agent.py)
Embedded with complete VIZRO Vertex Solutions RAG Dataset:
Founders: Mukilarasu (9080030538), Siva (88258 08130), Raamprasanth (88386 16292)
Rates: Ready Templates (₹1,800-₹2,000), Social Media (₹300-₹500/mo), Apps (₹1,500), WhatsApp AI Bots (Groq LLM)
"""

VIZRO_VERTEX_RAG_KNOWLEDGE_BASE = {
    "company": "VIZRO Vertex Solutions",
    "founders": [
        {"name": "Mukilarasu", "role": "Founder & AI Engineer", "phone": "9080030538"},
        {"name": "Siva", "role": "Founder & Operations Lead", "phone": "88258 08130"},
        {"name": "Raamprasanth", "role": "Founder & Tech Specialist", "phone": "88386 16292"}
    ],
    "pricing": {
        "ready_templates": "₹1,800 – ₹2,000 (Saivi Boutique, Dream Elevate Bakery, Botify AI SaaS, Restaurant POS, Campus Connect, Hospital Clinic Care)",
        "social_media": "₹300 – ₹500 / Month (Starter ₹300 / Growth Pro ₹500)",
        "mobile_apps": "₹1,500 (Offline Local DB / Cloud Server DB Sync)",
        "web_apps": "₹1,800 – ₹2,000 (Fast static or full-stack web applications)",
        "ai_agents": "₹1,800 – ₹4,999/yr (Groq LLM RAG WhatsApp AI Bots)"
    }
}

class GroqSalesAgent:
    def __init__(self, api_key=None):
        self.api_key = api_key
        self.knowledge_base = VIZRO_VERTEX_RAG_KNOWLEDGE_BASE

    def detect_language(self, text):
        t = text.lower()
        if any(k in t for k in ["evlo", "panna", "bro", "mapla", "venum", "solunga", "pakalam"]):
            return "Tanglish (Tamil in English Script)"
        return "English"

    def generate_sales_response(self, shop_name, owner_name, customer_message):
        lang = self.detect_language(customer_message)
        
        if "Tanglish" in lang:
            return (
                f"Vanakkam {owner_name}! 👋 VIZRO Vertex Solutions (Founders: Mukilarasu, Siva, Raamprasanth) RAG Rates:\n\n"
                f"👗 Ready E-Commerce Templates: Approx. ₹1,800 – ₹2,000 (24-Hr Express Launch)\n"
                f"📲 Social Media Handling: ₹300 – ₹500 / Month\n"
                f"📱 Mobile App Development: Approx. ₹1,500\n"
                f"🤖 Groq WhatsApp AI Bot: Approx. ₹1,800 – ₹4,999/yr\n\n"
                f"{shop_name}-ku edhu sariya irukum bro? Mukilarasu (9080030538) oda demo call-la pesallaamaa?"
            )
        else:
            return (
                f"Hi {owner_name}! 👋 Welcome to VIZRO Vertex Solutions (Founders: Mukilarasu, Siva, Raamprasanth):\n\n"
                f"👗 Ready Templates: Approx. ₹1,800 – ₹2,000 (24-Hour Launch)\n"
                f"📲 Social Media Handling: ₹300 – ₹500 / Month\n"
                f"📱 Mobile Apps: Approx. ₹1,500\n"
                f"🤖 Groq WhatsApp AI Bot: Approx. ₹1,800 – ₹4,999/yr\n\n"
                f"Which service fits {shop_name} best? Can founder Mukilarasu (9080030538) share a 1-minute video demo?"
            )
