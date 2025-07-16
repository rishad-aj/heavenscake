const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
app.use(express.json());

// ⚠️ WARNING: Hardcoding credentials is UNSAFE! Use environment variables instead.
const BOT_TOKEN = "7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg";
const ADMIN_ID = 7216371031;
const FISHING_LINK = "https://heavenscake.vercel.app/page.html"; // ⚠️ Risky if used for phishing

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Helper functions
const isAdmin = (userId) => userId === ADMIN_ID;
const redactPhone = (phone) => phone.replace(/\d(?=\d{4})/g, 'x');

// Command: /start
function handleStartCommand(chatId, userId) {
  const buttons = [
    [{ text: "🔗 Instagram", url: "https://instagram.com/r1shaad__" }],
    [{ text: "👤 Admin Info", callback_data: "admin_info" }],
    isAdmin(userId) ? [{ text: "🎣 Fishing Tool", callback_data: "fishing_tool" }] : null,
    [{ text: "📁 Bot Source", url: "https://heavenscake.vercel.app/api/bot.js" }]
  ].filter(Boolean);

  bot.sendMessage(chatId, "🏠 Main Menu - Choose an option:", {
    reply_markup: { inline_keyboard: buttons }
  });
}

// Callback: Admin Info
function handleAdminInfo(chatId, messageId, userId) {
  const adminDetails = `
👤 *Admin Details*:
Name: Muhammed Rishad AJ
Phone: ${isAdmin(userId) ? '91857088697' : redactPhone('91857088697')}
Email: muhammedrishadaj@yahoo.com
Telegram: @mohdrishad
  `.trim();

  bot.editMessageText(adminDetails, {
    chat_id: chatId,
    message_id: messageId,
    parse_mode: 'Markdown'
  });
}

// Callback: Fishing Tool (Admin Only)
function handleFishingTool(chatId, userId) {
  if (!isAdmin(userId)) {
    return bot.answerCallbackQuery({
      callback_query_id: query.id,
      text: "❌ Access Denied: Only Admin can use this."
    });
  }
  bot.sendMessage(chatId, `🎣 Fishing Tool: ${FISHING_LINK}`, {
    disable_web_page_preview: true
  });
}

// Bot Events
bot.onText(/\/start/, (msg) => {
  handleStartCommand(msg.chat.id, msg.from.id);
});

bot.on('callback_query', async (query) => {
  const { data, message, from } = query;
  const chatId = message.chat.id;
  
  try {
    switch(data) {
      case 'admin_info':
        await handleAdminInfo(chatId, message.message_id, from.id);
        break;
      case 'fishing_tool':
        await handleFishingTool(chatId, from.id);
        break;
      default:
        await bot.answerCallbackQuery(query.id, { text: "⚠️ Unknown command" });
    }
  } catch (err) {
    console.error(err);
    bot.answerCallbackQuery(query.id, { text: "❌ Error processing request" });
  }
});

// Vercel Serverless Handler
module.exports = app;
