/**
 * ⚡ GROQ LLM API CLIENT (server/ai/groqClient.js)
 * Model: llama-3.1-8b-instant (Fast high-throughput RAG) / llama-3.3-70b-versatile
 */

const GROQ_MODEL = "llama-3.1-8b-instant";

export async function generateGroqCompletion(messages, options = {}) {
  const apiKey = options.apiKey || process.env.GROQ_API_KEY || '';
  const model = options.model || GROQ_MODEL;

  if (!apiKey) {
    console.warn('[Groq Client] No GROQ_API_KEY available.');
    return null;
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: options.temperature || 0.6,
        max_tokens: options.max_tokens || 450
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.choices && data.choices.length > 0) {
        return data.choices[0].message.content;
      }
    } else {
      console.warn(`[Groq Client] HTTP error ${response.status}`);
    }
  } catch (err) {
    console.warn('[Groq Client Exception]:', err.message);
  }

  return null;
}
