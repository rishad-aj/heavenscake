// 🔐 Real credentials
const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const policeRequests = new Map(); // stores { verified: true/false }
const awaitingReplyFromAdmin = new Map(); // stores last chat needing reply

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('🟢 Bot is alive!');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = message?.text;
  const callbackQuery = body.callback_query;
  const photo = message?.photo;

  try {
    // Handle /start
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
      return res.status(200).send('OK');
    }

    // Handle police enquiry button
    if (callbackQuery?.data === 'police') {
      await sendMessageNoMarkdown(
        chatId,
        `🛂 Police Verification Required\n\n📸 Please send a clear photo of your Police ID.\nOur admin will verify and give you access to confidential resources.`
      );
      await answerCallback(callbackQuery.id);
      return res.status(200).send('OK');
    }

    // Handle photo ID submission (from police)
    if (photo && chatId.toString() !== ADMIN_CHAT_ID) {
      const fileId = photo[photo.length - 1].file_id;
      policeRequests.set(chatId, { verified: false });

      const caption = `📸 Police ID Submitted\nFrom: [User ID: ${chatId}]`;

      await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          photo: fileId,
          caption,
          reply_markup: {
            inline_keyboard: [
              [
                { text: `✅ Verify [${chatId}]`, callback_data: `verify_${chatId}` },
                { text: `❌ Deny [${chatId}]`, callback_data: `deny_${chatId}` }
              ]
            ]
          }
        })
      });

      await sendMessageNoMarkdown(chatId, `📤 Your ID has been received.\n🕵️‍♂️ It is under verification. Please wait.`);
      return res.status(200).send('OK');
    }

    // Handle admin verify/deny button
    if (callbackQuery && message.chat.id.toString() === ADMIN_CHAT_ID) {
      const data = callbackQuery.data;

      if (data.startsWith('verify_')) {
        const targetId = data.split('_')[1];
        policeRequests.set(Number(targetId), { verified: true });

        await sendMessageNoMarkdown(targetId, `✅ You have been verified as a police officer.\nPlease send your enquiry now.`);
        await sendMessageNoMarkdown(ADMIN_CHAT_ID, `✅ Verified police ID: ${targetId}`);
      }

      if (data.startsWith('deny_')) {
        const targetId = data.split('_')[1];
        policeRequests.delete(Number(targetId));

        await sendMessageNoMarkdown(targetId, `❌ Your police ID verification was denied. You can try again if needed.`);
        await sendMessageNoMarkdown(ADMIN_CHAT_ID, `❌ Denied police ID: ${targetId}`);
      }

      await answerCallback(callbackQuery.id);
      return res.status(200).send('OK');
    }

    // Handle verified police sending a request
    if (text && policeRequests.has(chatId) && policeRequests.get(chatId).verified) {
      const forwardMsg = `📤 Police Request Forwarded\nFrom: [User ID: ${chatId}]\nMessage: ${text}`;

      awaitingReplyFromAdmin.set(ADMIN_CHAT_ID, chatId); // store so admin reply knows where to go

      await sendMessageNoMarkdown(ADMIN_CHAT_ID, forwardMsg);
      await sendMessageNoMarkdown(chatId, `✅ Your message has been sent to the admin.`);
      return res.status(200).send('OK');
    }

    // Admin replies back to police
    if (text && chatId.toString() === ADMIN_CHAT_ID && awaitingReplyFromAdmin.has(chatId)) {
      const targetChatId = awaitingReplyFromAdmin.get(chatId);
      awaitingReplyFromAdmin.delete(chatId);

      await sendMessageNoMarkdown(targetChatId, `📨 Admin has responded:\n\n${text}`);
      await sendMessageNoMarkdown(targetChatId, `📬 For more help, contact the admin directly: @mohdrishad`);
      await sendMessageNoMarkdown(ADMIN_CHAT_ID, `✅ Your message has been delivered to the officer.`);
      return res.status(200).send('OK');
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 📋 Welcome screen
async function sendWelcomeWithButtons(chatId) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:',
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

// ✉️ Send plain text
async function sendMessageNoMarkdown(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}

// ✅ Answer callback buttons
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}
