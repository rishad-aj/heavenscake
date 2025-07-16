// api/bot.js

const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const ADMIN_CHAT_ID = '7216371031';

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
    // Handle /start
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
    }

    // Handle inline button clicks
    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = message.chat.id;
      const isAdmin = fromChatId.toString() === ADMIN_CHAT_ID;

      if (data === 'details') {
        if (isAdmin) {
          await sendMessage(fromChatId, `👑 *Admin Details*
Name: Muhammed Rishad AJ
Phone: 91857088697
Email: muhammedrishadaj@yahoo.com
Telegram: @mohdrishad
Instagram: [@r1shaad__](https://instagram.com/r1shaad__)`);
        } else {
          await sendMessage(fromChatId, `👤 *Admin Info*
Name: Muhammed Rishad AJ
Phone: xxx-xxx-xxxx
Email: muhammedrishadaj@yahoo.com
Telegram: @mohdrishad
Instagram: @r1shaad__`);
        }
      }

      else if (data === 'fishing') {
        if (isAdmin) {
          await sendMessage(fromChatId, `🎣 *Fishing Link (Private)*  
🔗 ||https://heavenscake.vercel.app/page.html||`);
        } else {
          await sendMessage(fromChatId, `🚫 *This feature is for admins only.*  
For enquiries, contact: @mohdrishad`);
        }
      }

      await answerCallback(callbackQuery.id);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// Show /start menu with buttons
async function sendWelcomeWithButtons(chatId) {
  const payload = {
    chat_id: chatId,
    text: `👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:`,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🔗 Get my Instagram',
            url: 'https://instagram.com/r1shaad__',
          }
        ],
        [
          {
            text: '👤 Admin Details',
            callback_data: 'details'
          },
          {
            text: '🎣 Let’s Fish',
            callback_data: 'fishing'
          }
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

// Send plain message
async function sendMessage(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown',
    }),
  });
}

// Acknowledge button click
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}
