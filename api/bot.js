const axios = require('axios');

// Telegram Bot Token
const BOT_TOKEN = '7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

let offset = 0;

const checkUpdates = async () => {
  try {
    const res = await axios.get(`${TELEGRAM_API}/getUpdates?offset=${offset}`);
    const updates = res.data.result;

    for (let update of updates) {
      offset = update.update_id + 1;

      // Handle normal messages
      if (update.message) {
        const message = update.message;
        const chatId = message.chat.id;
        const text = message.text;

        if (text === '/start') {
          const welcomeText = `👋 Welcome to Tecky Rishad Bot\n\n!Choose an option below:`;

          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: welcomeText,
            reply_markup: {
              inline_keyboard: [
                [
                  { text: 'Admins Insta - @r1shaad__', url: 'https://t.me/r1shaad__' }
                ],
                [
                  { text: 'Admin Details', callback_data: '/details' }
                ],
                [
                  { text: 'Let’s Fish 🎣', callback_data: '/fishing' }
                ]
              ]
            }
          });
        }
      }

      // Handle button callbacks
      if (update.callback_query) {
        const callback = update.callback_query;
        const chatId = callback.message.chat.id;
        const data = callback.data;

        if (data === '/details') {
          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: `👨‍💼 Admin Details:\n🆔 Admin ID: 7216371031\n📷 Instagram: @r1shaad__\n✉️ Contact: https://t.me/r1shaad__`
          });
        }

        if (data === '/fishing') {
          await axios.post(`${TELEGRAM_API}/sendMessage`, {
            chat_id: chatId,
            text: `🎣 Let's go fishing! Type /fish to start.`
          });
        }

        // Answer callback to remove the "loading..." state in Telegram
        await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
          callback_query_id: callback.id
        });
      }
    }
  } catch (error) {
    console.error('Error polling Telegram API:', error.message);
  }
};

// Start polling every 2 seconds
setInterval(checkUpdates, 2000);

console.log('🤖 Tecky Rishad Bot is running...');
