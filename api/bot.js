
const BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_ID = '7216371031'; // Replace with real Telegram ID

const bot = new Telegraf(BOT_TOKEN);

const pendingVerifications = new Map(); // userId -> file_id
const verifiedUsers = new Set(); // userId

// /start command
bot.start((ctx) => {
  ctx.reply('👋 Welcome to Tecky Rishad Bot! Choose an option below:',
    Markup.keyboard([
      ['✨ Join Our Community'],
      ['👤 Admin Details', '🎣 Let’s Fish'],
      ['🚨 Police Enquiry']
    ]).resize()
  );
});

// Handle button presses
bot.hears('🚨 Police Enquiry', (ctx) => {
  ctx.reply('🛂 Police Verification Required\n\n📸 Please send a clear photo of your Police ID. Our admin will verify and give you access to confidential resources.');
});

// Handle photo upload
bot.on('photo', (ctx) => {
  const userId = ctx.from.id;
  const photo = ctx.message.photo.pop(); // largest resolution
  pendingVerifications.set(userId, photo.file_id);

  ctx.reply('📤 Your ID has been received. 🕵️‍♂️ It is under verification. Please wait.');

  bot.telegram.sendPhoto(ADMIN_ID, photo.file_id, {
    caption: `👮 Police ID received from @${ctx.from.username || 'user'} (User ID: ${userId})`,
    reply_markup: {
      inline_keyboard: [[
        { text: '✅ Verify', callback_data: `verify_${userId}` },
        { text: '❌ Deny', callback_data: `deny_${userId}` }
      ]]
    }
  });
});

// Handle inline button actions by admin
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith('verify_')) {
    const userId = data.split('_')[1];
    verifiedUsers.add(parseInt(userId));
    await ctx.answerCbQuery('Verified');
    await bot.telegram.sendMessage(userId, '✅ You have been verified as a police officer. Please send your enquiry now.');
  }

  if (data.startsWith('deny_')) {
    const userId = data.split('_')[1];
    await ctx.answerCbQuery('Denied');
    await bot.telegram.sendMessage(userId, '❌ Your ID verification was denied by the admin.');
  }
});

// Handle enquiry from verified users
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  if (!verifiedUsers.has(userId)) return;

  if (text === '✅ Verify' || text === '❌ Deny') return;

  await ctx.reply('✅ Your message has been sent to the admin.');

  await bot.telegram.sendMessage(ADMIN_ID,
    `📩 Enquiry from verified officer @${ctx.from.username || 'user'} (ID: ${userId}):\n\n${text}`
  );
});

// Admin responds with /reply <userId> <message>
bot.command('reply', async (ctx) => {
  const [_, userId, ...messageParts] = ctx.message.text.split(' ');
  const message = messageParts.join(' ');

  if (!userId || !message) {
    return ctx.reply('Usage: /reply <userId> <message>');
  }

  await bot.telegram.sendMessage(userId, `📨 Admin has responded: ${message}\n📬 For more help, contact the admin directly: @mohdrishad`);
  ctx.reply('✅ Reply sent.');
});

// Launch bot
bot.launch();
console.log('🚀 Bot is running...');

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
