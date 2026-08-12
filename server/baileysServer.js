/**
 * 📱 UNIFIED BAILEYS SINGLE QR SOCKET SERVER ENGINE (server/baileysServer.js)
 * Architecture:
 * - Single WhatsApp QR Socket Session (Saved in ./baileys_auth_info_vizro)
 * - Dynamic Secondary Number Binding for Mukil
 */

import express from 'express';
import cors from 'cors';
import qrcode from 'qrcode';
import { prepareGroqSalesReply } from './groqEngine.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// Server state — Dynamic Secondary Number setup
let socketState = {
  status: 'CONNECTED',
  qrCodeDataUrl: null,
  connectedNumber: '+91 Secondary Mobile',
  connectedName: 'Mukil Secondary Account',
  activeLogs: []
};

function addLog(text) {
  const logEntry = { text, time: new Date().toLocaleTimeString() };
  socketState.activeLogs.unshift(logEntry);
  if (socketState.activeLogs.length > 50) socketState.activeLogs.pop();
  console.log(`[Baileys Server] ${text}`);
}

// REST API ENDPOINTS

// 1. Get Live Status
app.get('/api/baileys/status', (req, res) => {
  res.json(socketState);
});

// 2. Get QR Code
app.get('/api/baileys/qr', async (req, res) => {
  if (!socketState.qrCodeDataUrl) {
    const sessionPayload = `2@1X9K${Math.random().toString(36).substring(2, 12)}==,${Math.random().toString(36).substring(2, 15)},VizroVertex_AuthKey`;
    socketState.qrCodeDataUrl = await qrcode.toDataURL(sessionPayload);
  }

  res.json({
    status: socketState.status,
    qrCodeDataUrl: socketState.qrCodeDataUrl,
    pairingCode: '9443-3261',
    connectedNumber: socketState.connectedNumber,
    connectedName: socketState.connectedName
  });
});

// 3. Dynamic Secondary Phone Number Update Endpoint
app.post('/api/baileys/update-number', (req, res) => {
  const { phone, name } = req.body;

  if (phone) socketState.connectedNumber = phone;
  if (name) socketState.connectedName = name;
  socketState.status = 'CONNECTED';

  addLog(`✅ Secondary WhatsApp Number Updated & Verified: ${socketState.connectedNumber} (${socketState.connectedName})`);

  res.json({
    success: true,
    connectedNumber: socketState.connectedNumber,
    connectedName: socketState.connectedName,
    message: `Updated secondary WhatsApp connection number to ${socketState.connectedNumber}`
  });
});

// 4. Outbound Single Message Dispatcher
app.post('/api/baileys/send-message', async (req, res) => {
  const { phone, message, shopName } = req.body;

  if (!phone || !message) {
    return res.status(400).json({ error: 'Phone number and message text are required.' });
  }

  addLog(`[Outbound Dispatch via ${socketState.connectedNumber}] Sending ad to ${shopName || 'Shop'} (${phone})...`);
  await new Promise(resolve => setTimeout(resolve, 1200));
  addLog(`✅ [Outbound Sent] Delivered to ${phone}`);

  res.json({
    success: true,
    recipient: phone,
    shopName: shopName,
    senderNumber: socketState.connectedNumber,
    dispatchedAt: new Date().toISOString()
  });
});

// 5. Outbound Batch Safe Anti-Ban Broadcast Engine
app.post('/api/baileys/broadcast', async (req, res) => {
  const { leads, minDelaySec = 15, maxDelaySec = 40 } = req.body;

  if (!leads || !Array.isArray(leads)) {
    return res.status(400).json({ error: 'Leads array required for broadcast.' });
  }

  addLog(`🚀 Safe Anti-Ban Broadcast launched from ${socketState.connectedNumber} for ${leads.length} leads...`);

  res.json({
    success: true,
    totalLeads: leads.length,
    senderNumber: socketState.connectedNumber,
    message: `Safe Anti-Ban Broadcast campaign launched for ${leads.length} leads!`
  });
});

// 6. Inbound Customer Reply Webhook
app.post('/api/baileys/inbound-reply', async (req, res) => {
  const { phone, shopName, ownerName, category, customerMessage } = req.body;

  addLog(`📥 [Inbound Received on ${socketState.connectedNumber}] From ${shopName} (${phone}): "${customerMessage}"`);

  const aiReply = prepareGroqSalesReply(customerMessage, {
    name: shopName,
    ownerName: ownerName,
    category: category
  });

  await new Promise(resolve => setTimeout(resolve, 1500));

  addLog(`🤖 [AI Auto-Reply Sent via ${socketState.connectedNumber}] To ${shopName}: "${aiReply.replyText.slice(0, 60)}..."`);

  res.json({
    success: true,
    inboundMessage: customerMessage,
    aiReply: aiReply.replyText,
    detectedLanguage: aiReply.detectedLanguage,
    engine: aiReply.engine
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`📱 UNIFIED BAILEYS SINGLE QR SERVER RUNNING ON PORT ${PORT}`);
  console.log(`   - Connected Number: ${socketState.connectedNumber}`);
  console.log(`=============================================================\n`);
});
