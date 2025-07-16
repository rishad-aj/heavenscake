const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();
app.use(express.json());

// ⚠️ WARNING: Hardcoded credentials (replace with yours)
const BOT_TOKEN = "7740401254:AAGqaGtAQ2YEiwXtjert2CiuWFADXbGz3Jg";
const ADMIN_ID = 7216371031; // Your Telegram User ID
const FISHING_LINK = "https://heavenscake.vercel.app/page.html"; // Your link

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Helper: Redact phone number for non-admins
const redactPhone = (phone) => phone.replace(/\d(?=\d{4})/g, 'x');
const isAdmin = (userId) => userId === ADMIN_ID;

// /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const menuButtons = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔗 Instagram", url: "https://instagram.com/r1shaad__" },
          { text: "👤 Admin Info", callback_data: "admin_info" }
        ],
        isAdmin(userId) ? [{ text: "🎣 Fishing Tool", callback_data: "fishing_tool" }] : [],
        [
          { text: "📁 Bot Source", url: "https://heavenscake.vercel.app/api/bot.js" }
        ]
      ].filter(row => row.length > 0)
    }
  };

  bot.sendMessage(chatId, `🏠 *Welcome to the Bot!* 

Here are your options:
- Use /start to see this menu again
- Admin commands are restricted`, { parse_mode: 'Markdown', ...menuButtons });
});

// Callback queries
bot.on('callback_query', async (query) => {
  const { data, message, from } = query;
  const chatId = message.chat.id;

  try {
    switch (data) {
      case 'admin_info':
        const phone = isAdmin(from.id) ? '91857088697' : redactPhone('91857088697');
        const adminText = `
👤 *Admin Details*:
Name: Muhammed Rishad AJ
Phone: ${phone}
Email: muhammedrishadaj@yahoo.com
Telegram: @mohdrishad
        `.trim();
        bot.editMessageText(adminText, {
          chat_id: chatId,
          message_id: message.message_id,
          parse_mode: 'Markdown'
        });
        break;

      case 'fishing_tool':
        if (!isAdmin(from.id)) {
          await bot.answerCallbackQuery(query.id, { text: "❌ Admin only!" });
          return;
        }
        bot.sendMessage(chatId, `🔗 ${FISHING_LINK}`, { disable_web_page_preview: true });
        break;

      default:
        await bot.answerCallbackQuery(query.id, { text: "⚠️ Invalid option" });
    }
  } catch (err) {
    console.error(err);
    bot.answerCallbackQuery(query.id, { text: "🚨 Error processing request" });
  }
});

// Error handling
bot.on('polling_error', (err) => console.error('Polling error:', err));

// Start the bot
console.log("🤖 Bot is running...");

// For Vercel (uncomment if deploying)
// module.exports = app;
