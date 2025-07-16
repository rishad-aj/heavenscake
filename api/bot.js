// Code by @Teleservice_Assistant_bot
import axios from 'axios';

const BOT_TOKEN = '7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg'; // Your bot token
const ADMIN_ID = '7216371031'; // Your admin ID
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const body = req.body;

  try {
    // Handle the /start command
    if (body.message?.text === '/start') {
      const chatId = body.message.chat.id; // Extract chat ID from the incoming message
      const welcomeText = `👋 Welcome to Tecky Rishad Bot\n\nChoose an option below:`;

      await sendTelegramMessage(chatId, welcomeText, [
        [{ text: 'Admins Insta - @r1shaad__', url: 'https://t.me/r1shaad__' }],
        [{ text: 'Admin Details', callback_data: '/details' }],
        [{ text: 'Let’s Fish 🎣', callback_data: '/fishing' }]
      ]);
    }

    // Handle callback queries
    if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id; // Extract chat ID from the callback query
      const data = body.callback_query.data; // Extract data from callback query

      // Responding to Admin Details request
      if (data === '/details') {
        await sendTelegramMessage(chatId, `👨‍💼 Admin Details:\n🆔 Admin ID: ${ADMIN_ID}\n📷 Instagram: @r1shaad__\n✉️ Contact: https://t.me/r1shaad__`);
      }

      // Responding to Fishing request
      if (data === '/fishing') {
        await sendTelegramMessage(chatId, `🎣 Let's go fishing! Type /fish to start.`);
      }

      // Acknowledge the callback query
      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: body.callback_query.id
      });
    }

    return res.status(200).send('ok'); // Confirmation response
  } catch (err) {
    console.error('Bot error:', err.message);
    return res.status(500).send('Error'); // Error handling response
  }
}

// Function to send message to Telegram
async function sendTelegramMessage(chatId, text, inlineKeyboard = null) {
  const payload = {
    chat_id: chatId,
    text: text,
    reply_markup: inlineKeyboard ? { inline_keyboard: inlineKeyboard } : undefined
  };

  await axios.post(`${TELEGRAM_API}/sendMessage`, payload);
}
// Code end
