
const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
app.use(express.json());

const TELEGRAM_API_URL = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';

// Simulating in-memory stores (can be upgraded to Redis or DB)
const policeRequests = new Map(); // chatId => { verified: true }
const pendingPoliceQueries = new Map(); // chatId => true
const awaitingAdminResponse = new Map(); // admin chatId => user chatId

// 🔘 Telegram webhook route
app.post('/webhook', async (req, res) => {
  try {
    const body = req.body;
    const message = body.message || body.edited_message;
    const callbackQuery = body.callback_query;

    const chatId = message?.chat?.id || callbackQuery?.message?.chat?.id;
    const text = message?.text;

    // ✅ Handle callback queries
    if (callbackQuery) {
      await answerCallback(callbackQuery.id);

      const callbackData = callbackQuery.data;

      if (callbackData === 'details') {
        await sendMessage(chatId, `👤 *Admin Contact Info*\n\nFeel free to reach out: @mohdrishad`);
      } else if (callbackData === 'fishing') {
        await sendMessage(chatId, `🎣 *Let’s Fish!*\n\nYou just caught a coding bug 🐛 – but don’t worry, we’ll fry it!`);
      } else if (callbackData === 'police') {
        policeRequests.set(chatId, { verified: true });
        pendingPoliceQueries.set(chatId, true);
        await sendForceReply(chatId, '🚨 Please describe your issue in detail:');
      } else if (callbackData.startsWith('answer_')) {
        const targetId = callbackData.split('_')[1];
        awaitingAdminResponse.set(chatId, targetId);
        await sendForceReply(chatId, `📝 Please type your reply for user ID ${targetId}:`);
      }

      return res.status(200).send('OK');
    }

    // 📝 Handle user message for police requests
    if (text && policeRequests.has(chatId) && policeRequests.get(chatId).verified && pendingPoliceQueries.get(chatId)) {
      pendingPoliceQueries.delete(chatId);

      const escapedText = text.replace(/([_*[\]()~>#+=|{}.!\\-])/g, '\\$1');
      const forwardMsg = `📤 *Police Request Forwarded*\nFrom: [User ID: ${chatId}]\n\n📄 Message:\n${escapedText}`;

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: forwardMsg,
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✍️ Answer', callback_data: `answer_${chatId}` }]
            ]
          }
        })
      });

      await sendMessageNoMarkdown(chatId, '✅ Your enquiry has been received.\nThe admin will reply shortly.');
      return res.status(200).send('OK');
    }

    // 📨 Handle admin response to forwarded message
    if (text && chatId.toString() === ADMIN_CHAT_ID && awaitingAdminResponse.has(chatId)) {
      const targetChatId = awaitingAdminResponse.get(chatId);
      awaitingAdminResponse.delete(chatId);

      if (targetChatId) {
        const escapedReply = text.replace(/([_*[\]()~>#+=|{}.!\\-])/g, '\\$1');
        const fullReply = `📨 *Admin has responded:*\n\n${escapedReply}\n\n📬 *Direct contact to the admin may help your enquiry better:* @mohdrishad\n\n🙏 *Thank you!*`;

        await sendMessage(targetChatId, fullReply);
        await sendMessage(chatId, `✅ Message delivered to [${targetChatId}]`);
      }

      return res.status(200).send('OK');
    }

    // 🧭 Default response
    await sendWelcomeWithButtons(chatId);
    res.status(200).send('OK');

  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 🔘 Show welcome message
async function sendWelcomeWithButtons(chatId) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '👋 Welcome to *Tecky Rishad Bot*\\!\n\nChoose an option below:',
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✨ Join Our Community', url: 'https://t.me/r1shaad' }],
          [
            { text: '👤 Admin Details', callback_data: 'details' },
            { text: '🎣 Let’s Fish', callback_data: 'fishing' }
          ],
          [{ text: '🚨 Police Enquiry', callback_data: 'police' }]
        ]
      }
    })
  });
}

// 📬 Send Markdown message
async function sendMessage(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2'
    })
  });
}

// 📬 Send plain text (no Markdown)
async function sendMessageNoMarkdown(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}

// 📬 Send a forced reply
async function sendForceReply(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2',
      reply_markup: { force_reply: true }
    })
  });
}

// ✅ Answer Telegram callback
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}

// 🚀 Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🔥 Bot server running on port ${PORT}`));
