export default async function handler(req, res) {
  const BOT_TOKEN = "7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg";
  const ADMIN_ID = "7216371031";

  const TELEGRAM_LINK = "https://t.me/mohdrishad";
  const FISHING_URL = "https://heavenscake.vercel.app/page.html";
  const INSTAGRAM_URL = "https://instagram.com/r1shaad__";

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const body = req.body;
  console.log("📥 Incoming:", JSON.stringify(body, null, 2));

  // Handle /start
  if (body?.message?.text === "/start") {
    const chatId = body.message.chat.id;
    const reply_markup = {
      inline_keyboard: [
        [{ text: "🔗 My Instagram", url: INSTAGRAM_URL }],
        [
          { text: "👤 About Admin", callback_data: "details" },
          { text: "🎣 Let’s Fish", callback_data: "fishinglink" }
        ]
      ]
    };

    await sendMessage(BOT_TOKEN, chatId, "👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:", reply_markup);
    return res.status(200).send("Start command handled");
  }

  // Handle callback queries
  if (body.callback_query) {
    const query = body.callback_query;
    const chatId = query.message.chat.id;
    const userId = query.from.id.toString();
    const data = query.data;

    let message = "";

    switch (data) {
      case "details":
        message = (userId === ADMIN_ID)
          ? `👤 Admin Details:\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj@yahoo.com\nTelegram: @mohdrishad`
          : `👤 Admin Details:\nName: Muhammed Rishad AJ\nPhone: xxxxxxxxxx\nEmail: muhammedrishadaj@yahoo.com\nTelegram: @mohdrishad`;
        break;

      case "fishinglink":
        message = (userId === ADMIN_ID)
          ? `🎣 Click here to fish:\n${FISHING_URL}`
          : `🚫 Access Denied!\nAsk permission from admin:\n👉 ${TELEGRAM_LINK}`;
        break;

      default:
        message = "❓ Unknown action.";
    }

    await sendMessage(BOT_TOKEN, chatId, message);
    await answerCallback(BOT_TOKEN, query.id);
    return res.status(200).send("Callback handled");
  }

  return res.status(200).send("No action taken");
}

// Helper to send messages
async function sendMessage(botToken, chatId, text, reply_markup = null) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const payload = {
    chat_id: chatId,
    text,
    reply_markup
  };
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// Helper to answer callback query
async function answerCallback(botToken, callback_query_id) {
  const url = `https://api.telegram.org/bot${botToken}/answerCallbackQuery`;
  const payload = { callback_query_id };
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}
