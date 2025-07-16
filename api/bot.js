// api/bot.js

const TELEGRAM_BOT_TOKEN = '7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;
const ADMIN_CHAT_ID = '7216371031';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = body.message?.text;
  const callbackQuery = body.callback_query;

  // Handle /start
  if (text === '/start') {
    await sendWelcomeWithButtons(chatId);
  }

  // Handle inline button clicks
  if (callbackQuery) {
    const data = callbackQuery.data;

    if (data === 'details') {
      await sendMessage(chatId, 'You selected: /details');
    } else if (data === 'fishing') {
      await sendMessage(chatId, 'You selected: /fishing');
    }

    await answerCallback(callbackQuery.id);
  }

  res.status(200).send('OK');
}

// 🔘 Send /start menu with inline buttons
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

// 📤 Send plain message
async function sendMessage(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message }),
  });
}

// ✅ Acknowledge button click
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}
