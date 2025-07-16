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
  if (body.message?.text === "/start") {
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

    await sendMessage(chatId, "👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:", reply_markup);
    return res.status(200).send("start command sent");
  }

  // Handle callback buttons
  if (body.callback_query) {
    const query = body.callback_query;
    const userId = query.from.id.toString();
    const chatId = query.message.chat.id;
    const data = query.data;

    let message = "";

    if (data === "admin_info") {
      message = (userId === ADMIN_ID)
        ? `👤 Admin Details:\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj@yahoo.com\nTelegram: @mohdrishad`
        : `👤 Admin Details:\nName: Muhammed Rishad AJ\nPhone: xxxxxxxxxx\nEmail: muhammedrishadaj@yahoo.com\nTelegram: @mohdrishad`;
    }

    if (data === "fish_request") {
      message = (userId === ADMIN_ID)
        ? `🎣 Click here to fish:\n${FISHING_URL}`
        : `🚫 This is not for you!\nAsk permission from admin:\n👉 ${TELEGRAM_LINK}`;
    }

    // Send reply message
    await sendMessage(chatId, message);

    // Acknowledge the button press to remove "Loading..."
    await answerCallback(query.id);

    return res.status(200).send("callback_query handled");
  }

  return res.status(200).send("no action taken");
}

// Send message
async function sendMessage(chatId, text, reply_markup = null) {
  await fetch(`https://api.telegram.org/bot7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      reply_markup
    })
  });
}

// Acknowledge callback button click
async function answerCallback(callback_query_id) {
  await fetch(`https://api.telegram.org/bot7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id
    })
  });
}
