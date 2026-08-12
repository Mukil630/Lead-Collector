/**
 * 🛡️ SAFE ANTI-BAN WHATSAPP BROADCAST ENGINE
 * Solves WhatsApp number blocking for large lead campaigns
 */

export class SafeBroadcastEngine {
  constructor(config = {}) {
    this.minDelaySec = config.minDelaySec || 15;
    this.maxDelaySec = config.maxDelaySec || 40;
    this.batchSize = config.batchSize || 10;
    this.cooldownMin = config.cooldownMin || 3;
    this.enableTypingSim = config.enableTypingSim !== undefined ? config.enableTypingSim : true;
    this.enableSpintaxJitter = config.enableSpintaxJitter !== undefined ? config.enableSpintaxJitter : true;

    this.queue = [];
    this.sentCount = 0;
    this.failedCount = 0;
    this.isRunning = false;
    this.currentLead = null;
    this.statusText = 'IDLE';
  }

  /**
   * Applies Spintax & Variation Jitter to avoid duplicate message signatures
   */
  applyMessageJitter(adMessage, lead) {
    if (!this.enableSpintaxJitter) return adMessage;

    const greetings = ['Vanakkam', 'Hi', 'Hello', 'Greetings'];
    const closings = [
      'Would you be open to a quick 2-minute call?',
      'Can I share a quick 1-minute video demo?',
      'Would you be interested in discussing this?',
      'Let me know if you would like more details!'
    ];

    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    const randomClosing = closings[Math.floor(Math.random() * closings.length)];
    const ownerName = (lead.ownerName || 'Sir/Maam').split(' ')[0];

    // Swap greeting dynamically
    let variated = adMessage.replace(/^(Vanakkam|Hi|Hello|Greetings)\s+\w+!/i, `${randomGreeting} ${ownerName}!`);

    // Swap signature closing
    variated = variated.replace(/(Would you be open to a quick 2-minute call.*|Can I share a quick 1-minute video demo.*)/i, randomClosing);

    return variated;
  }

  /**
   * Calculates random delay in milliseconds between min & max range
   */
  getRandomDelayMs() {
    const rangeSec = this.maxDelaySec - this.minDelaySec;
    const randomSec = this.minDelaySec + Math.random() * rangeSec;
    return Math.floor(randomSec * 1000);
  }

  /**
   * Simulates Baileys socket dispatch with safe delay & typing state
   */
  async processBatchItem(item, onProgress) {
    this.currentLead = item;
    const delayMs = this.getRandomDelayMs();
    this.statusText = `Simulating Human Typing (Delay: ${(delayMs / 1000).toFixed(1)}s)...`;
    if (onProgress) onProgress(this.getStatus());

    await new Promise(res => setTimeout(res, delayMs));

    this.sentCount++;
    this.statusText = `Dispatched message to ${item.shopName} (${item.phone})`;
    if (onProgress) onProgress(this.getStatus());
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      sentCount: this.sentCount,
      failedCount: this.failedCount,
      remainingCount: this.queue.length,
      statusText: this.statusText,
      currentLead: this.currentLead,
      safeDelayRange: `${this.minDelaySec}s - ${this.maxDelaySec}s`,
      batchSize: this.batchSize,
      cooldownMin: this.cooldownMin
    };
  }
}
