import axios from 'axios';

const BOT_TOKEN = '7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg';
const ADMIN_ID = '7216371031';
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  const body = req.body;

  try {
    if (body.message?.text === '/start') {
      const chatId = body.message.chat.id;
      const welcomeText = `👋 Welcome to Tecky Rishad Bot\n\n!Choose an option below:`;

      await axios.post(`${TELEGRAM_API}/sendMessage`, {
        chat_id: chatId,
        text: welcomeText,
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Admins Insta - @r1shaad__', url: 'https://t.me/r1shaad__' }],
            [{ text: 'Admin Details', callback_data: '/details' }],
            [{ text: 'Let’s Fish 🎣', callback_data: '/fishing' }]
          ]
        }
      });
    }

    if (body.callback_query) {
      const chatId = body.callback_query.message.chat.id;
      const data = body.callback_query.data;

      if (data === '/details') {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `👨‍💼 Admin Details:\n🆔 Admin ID: ${ADMIN_ID}\n📷 Instagram: @r1shaad__\n✉️ Contact: https://t.me/r1shaad__`
        });
      }

      if (data === '/fishing') {
        await axios.post(`${TELEGRAM_API}/sendMessage`, {
          chat_id: chatId,
          text: `🎣 Let's go fishing! Type /fish to start.`
        });
      }

      await axios.post(`${TELEGRAM_API}/answerCallbackQuery`, {
        callback_query_id: body.callback_query.id
      });
    }

    return res.status(200).send('ok');
  } catch (err) {
    console.error('Bot error:', err.message);
    return res.status(500).send('Error');
  }
}
