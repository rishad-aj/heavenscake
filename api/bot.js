const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// In-memory trackers
const policeRequests = new Map();
const pendingPoliceQueries = new Map();

export default async function handler(req, res) {
  console.log('📩 Telegram Webhook Received:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = body.message?.text;
  const callbackQuery = body.callback_query;
  const photo = body.message?.photo;

  try {
    // 🟡 /start command
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
    }

    // 🟢 Handle Police ID Photo
    if (photo && chatId.toString() !== ADMIN_CHAT_ID) {
      const fileId = photo[photo.length - 1].file_id;

      policeRequests.set(chatId, { verified: false });

      const caption = `📸 *Police ID Submitted*\nFrom: [User ID: ${chatId}]`;

      await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          photo: fileId,
          caption,
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `✅ Verify [${chatId}]`,
                  callback_data: `verify_${chatId}`
                }
              ]
            ]
          }
        })
      });

      await sendMessage(chatId, `🕵️‍♂️ Your Police ID has been submitted.\nPlease wait while our admin reviews it.`);
    }

    // 📨 Police officer sends request for details
    if (text && policeRequests.has(chatId) && policeRequests.get(chatId).verified && pendingPoliceQueries.get(chatId)) {
      pendingPoliceQueries.delete(chatId);

      const forwardMsg = `📤 *Police Request Forwarded*\nFrom: [User ID: ${chatId}]\n\n📄 Message:\n${text}`;
      await sendMessage(ADMIN_CHAT_ID, forwardMsg);

      await sendMessage(chatId, `📡 Your request has been forwarded to the admin.\nPlease wait for a response.`);
    }

    // 📤 Admin replies to forwarded message
    if (text && chatId.toString() === ADMIN_CHAT_ID && message?.reply_to_message?.text?.includes('Police Request Forwarded')) {
      const match = message.reply_to_message.text.match(/User ID: (\d+)/);
      const targetChatId = match?.[1];

      if (targetChatId) {
        await sendMessage(targetChatId,
          `📨 *Admin has responded:*\n\n${text}\n\n🔗 [Contact Admin](https://t.me/mohdrishad)`);
      }
    }

    // 🔁 Handle button callbacks
    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = message.chat.id.toString();
      const isAdmin = fromChatId === ADMIN_CHAT_ID;

      console.log('Button callback:', { data, fromChatId, isAdmin });

      if (data === 'details') {
        const adminMessage = isAdmin
          ? `👑 *Admin Details*\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: [@r1shaad\\_\\_](https://instagram.com/r1shaad__)`
          : `👤 *Admin Info*\nName: Muhammed Rishad AJ\nPhone: xxx\\-xxx\\-xxxx\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: @r1shaad\\_\\_`;
        await sendMessage(fromChatId, adminMessage);
      }

      else if (data === 'fishing') {
        const fishingMessage = isAdmin
          ? '🎣 Fishing Link (Private): ||https://heavenscake.vercel.app/page.html||'
          : '🚫 This feature is not for you. Access is restricted.';
        await sendMessage(fromChatId, fishingMessage);
      }

      else if (data === 'police') {
        await sendMessageNoMarkdown(fromChatId,
          `🛂 Police Verification Required\n\n📸 Please send a clear photo of your Police ID.\nOur admin will verify and give you confidential access.`);
      }

      else if (data.startsWith('verify_') && isAdmin) {
        const targetChatId = data.split('_')[1];

        policeRequests.set(Number(targetChatId), { verified: true });

        await sendMessage(targetChatId,
          `✅ *You have been verified as a police officer\\!*\n\nHere are the confidential details:\n\n` +
          `👤 *Admin Name:* Muhammed Rishad\n` +
          `🎂 *DOB:* 01\\/01\\/1990\n` +
          `📞 *Phone:* +91 98765 43210\n` +
          `📧 *Email:* muhammedrishadaj\\@yahoo\\.com\n` +
          `🤖 *Bot Scripts, API & Internal Access: Provided*`);

        await sendMessage(ADMIN_CHAT_ID, `✅ Police verified: ${targetChatId}`);

        await sendMessage(targetChatId, `📥 *Describe what details you need:*\n\nFor example: "Need admin's phone and bot API access."`);
        pendingPoliceQueries.set(Number(targetChatId), true);
      }

      await answerCallback(callbackQuery.id);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 🎛️ /start button menu
async function sendWelcomeWithButtons(chatId) {
  const payload = {
    chat_id: chatId,
    text: `👋 Welcome to *Tecky Rishad Bot*\\!\n\nChoose an option below:`,
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✨ Join Our Community',
            url: 'https://t.me/r1shaad'
          }
        ],
        [
          { text: '👤 Admin Details', callback_data: 'details' },
          { text: '🎣 Let’s Fish', callback_data: 'fishing' }
        ],
        [
          { text: '🚨 Police Enquiry', callback_data: 'police' }
        ]
      ]
    }
  };

  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// ✉️ MarkdownV2 message
async function sendMessage(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2',
    }),
  });
}

// ✉️ Plain text message
async function sendMessageNoMarkdown(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    }),
  });
}

// ✅ Answer callback
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}
