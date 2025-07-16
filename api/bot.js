// /api/bot.js

const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE'; // Replace with your real bot token
const ADMIN_CHAT_ID = 'YOUR_ADMIN_CHAT_ID_HERE'; // Replace with your Telegram user ID as string
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export default async function handler(req, res) {
  console.log('📩 Incoming Telegram webhook:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = body.message?.text;
  const callbackQuery = body.callback_query;

  try {
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
    }

    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = message.chat.id;
      const isAdmin = fromChatId.toString() === ADMIN_CHAT_ID;

      if (data === 'details') {
        const adminMessage = isAdmin
          ? `👑 *Admin Details*\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: [@r1shaad\\_\\_](https://instagram.com/r1shaad__)`
          : `👤 *Admin Info*\nName: Muhammed Rishad AJ\nPhone: xxx\\-xxx\\-xxxx\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: @r1shaad\\_\\_`;

        await sendMessage(fromChatId, adminMessage);
      }

      else if (data === 'fishing') {
        const fishingMessage = isAdmin
          ? `🎣 *Fishing Link \\(Private\\)*\n🔗 ||https://heavenscake\\.vercel\\.app/page\\.html||`
          : `🚫 *This feature is for admins only\\.*\nFor enquiries, contact: @mohdrishad`;

        await sendMessage(fromChatId, fishingMessage);
      }

      else if (data === 'police') {
        await sendMessage(fromChatId,
          `🛂 *Police Verification Required*\n\nTo access confidential bot and admin details, please:\n\n1\\. 📸 Send a clear photo of your *Police ID*\n2\\. ✅ Wait for our admin to manually verify you\n\nOnce verified, you will receive:\n\n- 👤 Admin full name\n- 🎂 Date of Birth\n- 📞 Phone & WhatsApp number\n- 📧 Email address\n- 🤖 Bot command scripts\n- 🔐 API token & integrations\n- 🧰 Internal access features\n\n*Please note:* This is a secure process\\. Misuse or false identification will result in permanent ban\\.`);
      }

      await answerCallback(callbackQuery.id);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 👉 Welcome menu with inline buttons
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

// 👉 Send a MarkdownV2 message
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

// ✅ Answer the callback so Telegram UI doesn't spin forever
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}
