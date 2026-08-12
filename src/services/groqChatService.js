/**
 * 🧠 OFFICIAL VIZRO VERTEX GROQ AI RAG ASSISTANT SERVICE
 * Synchronized directly with https://vizro.vercel.app/
 */

export const VIZRO_VERTEX_RAG_KNOWLEDGE_BASE = {
  company: "Vizro Vertex Software Solution",
  location: "Karur, Tamil Nadu",
  founders: [
    { name: "Mukilarasu", role: "Founder & AI Engineer", phone: "9080030538" },
    { name: "Siva", role: "Co-Founder & Operations", phone: "88258 08130" },
    { name: "Raamprasanth", role: "Co-Founder & Tech Specialist", phone: "88386 16292" }
  ],
  pricingPackages: {
    smallTemplates: "₹1800 - ₹2000",
    standardApps: "₹5000 - ₹6000",
    advancedProjects: "Max ₹8000",
    socialMedia: "₹300 - ₹500/month",
    schoolCollege: "₹800 - ₹1200"
  }
};

export const VIZRO_VERTEX_KNOWLEDGE_BASE = VIZRO_VERTEX_RAG_KNOWLEDGE_BASE;

export class GroqChatSalesService {
  constructor(apiKey = '') {
    this.apiKey = apiKey || import.meta.env?.VITE_GROQ_API_KEY || '';
    this.model = 'llama-3.3-70b-versatile';
    this.conversationHistory = [];
  }

  async sendChatMessage(userMessage) {
    this.conversationHistory.push({ role: 'user', content: userMessage });

    if (!this.apiKey) {
      const fallback = `Vanakkam, bro! Welcome to VIZRO Vertex Solutions! What app, website, or AI tool would you like to build today?`;
      this.conversationHistory.push({ role: 'assistant', content: fallback });
      return { replyText: fallback, engine: 'Fallback' };
    }

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are VIZRO Customer Queries Bot for VIZRO Vertex Solutions (Karur). Help customers with software requirements. Speak in friendly Tanglish using "bro", "vanakkam!", "super!". Rates: Small ₹2k, Standard ₹5k-₹6k, Advanced Max ₹8k.`
            },
            ...this.conversationHistory.slice(-6)
          ],
          temperature: 0.7,
          max_tokens: 450
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices.length > 0) {
          const reply = data.choices[0].message.content;
          this.conversationHistory.push({ role: 'assistant', content: reply });
          return { replyText: reply, engine: 'Groq LLaMA-3.3 70B' };
        }
      }
    } catch (err) {
      console.warn('[Groq Client Error]:', err.message);
    }

    const fallback = `Vanakkam, bro! Welcome to VIZRO Vertex Solutions! Tell me what project you want to build today!`;
    this.conversationHistory.push({ role: 'assistant', content: fallback });
    return { replyText: fallback, engine: 'Fallback' };
  }
}
