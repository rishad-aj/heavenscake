const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Your bot token and admin ID
const BOT_TOKEN = '7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg';
const ADMIN_ID = '7216371031';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

app.use(bodyParser.json());

// Telegram webhook endpoint
app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  const callback = req.body.callback_query;

  // Handle /start command
  if (message && message.text === '/start') {
    const chatId = message.chat.id;

    const welcomeText = `👋 Welcome to Tecky Rishad Bot\n\n!Choose an option below:`;

    const keyboard = {
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
    };

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: welcomeText,
      reply_markup: keyboard
    });
  }

  // Handle button presses (callback queries)
  else if (callback) {
    const chatId = callback.message.chat.id;
    const data = callback.data;

    if (data === '/details') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `👨‍💼 Admin Details:\n🆔 Admin ID: ${ADMIN_ID}\n📷 Instagram: @r1shaad__\n✉️ Contact via Telegram: https://t.me/r1shaad__`
      });
    }

    if (data === '/fishing') {
      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: `🎣 Let's go fishing!\nType /fish to start.`
      });
    }

    // Remove loading spinner on button click
    await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
      callback_query_id: callback.id
    });
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`✅ Bot server running on port ${PORT}`);
});
