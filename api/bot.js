
// === HARD-CODED CONFIG ===
const BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';       // <-- Put your actual bot token here
const ADMIN_ID = 7216371031;                    // <-- Replace with your Telegram numeric user ID

// === BOT SETUP ===
const bot = new Telegraf(BOT_TOKEN);

const pendingVerifications = new Map(); // Map<userId, file_id>
const verifiedUsers = new Set();        // Set<userId>

console.log('✅ bot.js loaded...');

// === /start COMMAND ===
bot.start((ctx) => {
  console.log(`➡️ /start from ${ctx.from.username || ctx.from.id}`);
  ctx.reply('👋 Welcome to Tecky Rishad Bot! Choose an option below:',
    Markup.keyboard([
      ['✨ Join Our Community'],
      ['👤 Admin Details', '🎣 Let’s Fish'],
      ['🚨 Police Enquiry']
    ]).resize()
  );
});

// === POLICE ENQUIRY BUTTON ===
bot.hears('🚨 Police Enquiry', (ctx) => {
  ctx.reply('🛂 Police Verification Required\n\n📸 Please send a clear photo of your Police ID. Our admin will verify and give you access to confidential resources.');
});

// === HANDLE PHOTO UPLOAD ===
bot.on('photo', (ctx) => {
  const userId = ctx.from.id;
  const photo = ctx.message.photo.pop(); // highest resolution
  pendingVerifications.set(userId, photo.file_id);

  ctx.reply('📤 Your ID has been received. 🕵️‍♂️ It is under verification. Please wait.');

  // Send to admin with buttons
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

// === HANDLE VERIFY/DENY ACTIONS ===
bot.on('callback_query', async (ctx) => {
  const data = ctx.callbackQuery.data;

  if (data.startsWith('verify_')) {
    const userId = parseInt(data.split('_')[1]);
    verifiedUsers.add(userId);
    await ctx.answerCbQuery('✅ Verified');
    await bot.telegram.sendMessage(userId, '✅ You have been verified as a police officer. Please send your enquiry now.');
  }

  if (data.startsWith('deny_')) {
    const userId = parseInt(data.split('_')[1]);
    await ctx.answerCbQuery('❌ Denied');
    await bot.telegram.sendMessage(userId, '❌ Your ID verification was denied by the admin.');
  }
});

// === HANDLE TEXT MESSAGES FROM VERIFIED USERS ===
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const text = ctx.message.text;

  // Allow unverified users to access basic buttons
  if (!verifiedUsers.has(userId)) return;

  if (text === '✅ Verify' || text === '❌ Deny') return;

  await ctx.reply('✅ Your message has been sent to the admin.');

  await bot.telegram.sendMessage(ADMIN_ID,
    `📩 Enquiry from verified officer @${ctx.from.username || 'user'} (ID: ${userId}):\n\n${text}`
  );
});

// === ADMIN REPLY TO OFFICER ===
// Format: /reply <userId> <message>
bot.command('reply', async (ctx) => {
  const parts = ctx.message.text.split(' ');
  const userId = parts[1];
  const message = parts.slice(2).join(' ');

  if (!userId || !message) {
    return ctx.reply('⚠️ Usage: /reply <userId> <message>');
  }

  try {
    await bot.telegram.sendMessage(userId, `📨 Admin has responded: ${message}\n📬 For more help, contact the admin directly: @mohdrishad`);
    ctx.reply('✅ Reply sent.');
  } catch (err) {
    ctx.reply('❌ Failed to send message. Check the user ID.');
    console.error('Error sending reply:', err);
  }
});

// === GLOBAL ERROR HANDLING ===
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
});

// === START BOT ===
bot.launch().then(() => {
  console.log('🚀 Tecky Rishad Bot is live!');
});
