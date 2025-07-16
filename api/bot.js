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

  // Handle text commands
  if (body.message) {
    const chatId = body.message.chat.id.toString();
    const text = body.message.text;

    // /start command — show buttons
    if (text === "/start") {
      const reply_markup = {
        inline_keyboard: [
          [
            { text: "🔗 My Instagram", url: INSTAGRAM_URL }
          ],
          [
            { text: "👤 About Admin", switch_inline_query_current_chat: "/details" },
            { text: "🎣 Let’s Fish", switch_inline_query_current_chat: "/fishinglink" }
          ]
        ]
      };

      await sendMessage(chatId, "👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:", reply_markup);
      return res.status(200).send("start handled");
    }

    // /details command
    if (text === "/details") {
      const msg = (chatId === ADMIN_ID)
        ? `👤 Admin Details:\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj@yahoo.com\nTelegram: @mohdrishad`
        : `👤 Admin Details:\nName: Muhammed Rishad AJ\nPhone: xxxxxxxxxx\nEmail: muhammedrishadaj@yahoo.com\nTelegram: @mohdrishad`;
      await sendMessage(chatId, msg);
      return res.status(200).send("details sent");
    }

    // /fishinglink command
    if (text === "/fishinglink") {
      const msg = (chatId === ADMIN_ID)
        ? `🎣 Click here to fish:\n${FISHING_URL}`
        : `🚫 This is not for you!\nAsk admin permission:\n👉 ${TELEGRAM_LINK}`;
      await sendMessage(chatId, msg);
      return res.status(200).send("fishing link sent");
    }
  }

  return res.status(200).send("no command matched");
}

// Send Telegram message
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
