const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TelegramBot = require('node-telegram-bot-api');

// Replace with your actual bot token from @BotFather
const token = 'YOUR_BOT_TOKEN_HERE';
const adminUserId = 123456789; // Replace with your Telegram user ID

const bot = new TelegramBot(token, { polling: true });

// Start command or any message
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  const welcomeMessage = `👋 Welcome to *Tecky Rishad Bot!*\n\nChoose an option below:`;
  const options = {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{ text: '✨ Join Our Community', url: 'https://t.me/r1shaad' }],
        [
          { text: '👑 Admin Details', callback_data: 'admin_details' },
          { text: '🎣 Let’s Fish', callback_data: 'fishing_link' }
        ],
        [{ text: '🚨 Police Enquiry', callback_data: 'police_enquiry' }]
      ]
    }
  };

  bot.sendMessage(chatId, welcomeMessage, options);
});

// Callback query handler
bot.on('callback_query', (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const isAdmin = userId === adminUserId;

  switch (query.data) {
    case 'admin_details':
      const adminMsg = `👑 *Admin Details*\n` +
        `Name: Muhammed Rishad AJ\n` +
        `Phone: ${isAdmin ? '91857088697' : 'xxx-xxx-xxxx'}\n` +
        `Email: muhammedrishadaj@yahoo.com\n` +
        `Telegram: @mohdrishad\n` +
        `Instagram: [@r1shaad__](https://instagram.com/r1shaad__)`;

      bot.sendMessage(chatId, adminMsg, { parse_mode: 'Markdown' });
      break;

    case 'fishing_link':
      if (isAdmin) {
        bot.sendMessage(chatId, `🎣 *Fishing Link (Private)*\n` +
          `||🔗 https://heavenscake.vercel.app/page.html||`, {
            parse_mode: 'MarkdownV2'
          });
      } else {
        bot.sendMessage(chatId, `🚫 *This feature is for admins only.*`, {
          parse_mode: 'Markdown'
        });
      }
      break;

    case 'police_enquiry':
      bot.sendMessage(chatId, '🚨 Please contact your nearest police station.');
      break;
  }

  bot.answerCallbackQuery(query.id); // To remove the loading spinner
});
