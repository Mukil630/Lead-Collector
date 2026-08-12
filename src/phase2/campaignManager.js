/**
 * 📌 JS Campaign Manager for Phase 2 Automation
 * Coordinates the full node execution pipeline:
 * Lead Fetcher ➔ WhatsApp Checker ➔ Message Generator ➔ WhatsApp Sender ➔ Status Manager
 */

import { StatusManager, LEAD_STATUS } from './statusManager.js';
import { LeadFetcher } from './leadFetcher.js';
import { WhatsAppChecker } from './whatsappChecker.js';
import { MessageGenerator } from './messageGenerator.js';
import { WhatsAppSender } from './whatsappSender.js';

export class CampaignManager {
  constructor(dbRecords = [], senderName = 'Mukil Arasu', companyName = 'Antigravity AI & Tech Solutions') {
    this.statusManager = new StatusManager(dbRecords);
    this.leadFetcher = new LeadFetcher(this.statusManager);
    this.whatsappChecker = new WhatsAppChecker(this.statusManager);
    this.messageGenerator = new MessageGenerator(senderName, companyName);
    this.whatsappSender = new WhatsAppSender(this.statusManager);
  }

  async runPhase2Pipeline(callback = null) {
    const summary = {
      fetchedCount: 0,
      whatsappAvailableCount: 0,
      whatsappNotFoundCount: 0,
      messagesSentCount: 0,
      details: []
    };

    // Step 1: Lead Fetcher (Query status == "NEW")
    const newLeads = this.leadFetcher.fetchNewLeads();
    summary.fetchedCount = newLeads.length;

    if (callback) {
      await callback('LEAD_FETCHER', `Fetched ${newLeads.length} leads with status = "NEW"`, { leads: newLeads });
    }

    // Step-by-step modular pipeline
    for (const lead of newLeads) {
      const bName = lead.name || lead.business_name;

      // Step 2: WhatsApp Checker
      const checkRes = await this.whatsappChecker.checkWhatsAppEligibility(lead);

      if (callback) {
        await callback('WHATSAPP_CHECKER', `Checked WhatsApp eligibility for ${bName}`, checkRes);
      }

      if (!checkRes.eligible) {
        summary.whatsappNotFoundCount++;
        summary.details.push({
          businessName: bName,
          status: LEAD_STATUS.WHATSAPP_NOT_FOUND,
          reason: checkRes.reason
        });
        continue;
      }

      summary.whatsappAvailableCount++;

      // Step 3: Message Generator
      const pitchText = this.messageGenerator.generateAdvertisementPitch(lead);
      if (callback) {
        await callback('MESSAGE_GENERATOR', `Generated advertisement pitch for ${bName}`, { pitchText });
      }

      // Step 4: WhatsApp Sender & Status Manager
      const sendRes = await this.whatsappSender.sendMessage(lead, pitchText, checkRes.formattedPhone);
      summary.messagesSentCount++;
      summary.details.push(sendRes);

      if (callback) {
        await callback('WHATSAPP_SENDER', `Dispatched WhatsApp pitch & set status = "MESSAGE_SENT" for ${bName}`, sendRes);
      }
    }

    return summary;
  }
}
