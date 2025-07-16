const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// In-memory map to track police requests
const policeRequests = new Map();

export default async function handler(req, res) {
  console.log('📩 Telegram Update:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = body.message?.text;
  const callbackQuery = body.callback_query;
  const photo = body.message?.photo;

  try {
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
    }

    // 🖼️ Police sends photo ID
    if (photo && chatId !== ADMIN_CHAT_ID) {
      const fileId = photo[photo.length - 1].file_id; // Get highest resolution
      const caption = `📸 *Police ID Submitted*\nFrom: [User ID: ${chatId}]`;

      // Track police request
      policeRequests.set(chatId, { verified: false });

      // Forward to admin with "Verify" button
      await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          photo: fileId,
          caption,
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: `✅ Verify [${chatId}]`,
                  callback_data: `verify_${chatId}`
                }
              ]
            ]
          }
        }),
      });

      await sendMessage(chatId, `🕵️‍♂️ Your Police ID has been submitted.\nPlease wait for admin verification.`);
    }

    // 🧠 Callback Handling
    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = message.chat.id;
      const isAdmin = fromChatId.toString() === ADMIN_CHAT_ID;

      if (data === 'details') {
        const adminMessage = isAdmin
          ? `👑 *Admin Details*\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: [@r1shaad\\_\\_](https://instagram.com/r1shaad__)`
          : `👤 *Admin Info*\nName: Muhammed Rishad AJ\nPhone: xxx\\-xxx\\-xxxx\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: @r1shaad\\_\\_`;
        await sendMessage(fromChatId, adminMessage);
      }

      else if (data === 'fishing') {
        const msg = isAdmin
          ? `🎣 *Fishing Link \\(Private\\)*\n🔗 ||https://heavenscake\\.vercel\\.app/page\\.html||`
          : `🚫 *This feature is for admins only`;
        await sendMessage(fromChatId, msg);
      }

      else if (data === 'police') {
        await sendMessage(fromChatId,
          `🛂 *Police Verification Required*\n\n📸 Please send a clear photo of your *Police ID*\.\nOur admin will review and verify you before providing access to restricted info.`);
      }

      else if (data.startsWith('verify_') && isAdmin) {
        const targetChatId = data.split('_')[1];

        // Send confirmation to police
        await sendMessage(targetChatId,
          `✅ *You have been verified!*\n\nHere are your confidential details:\n\n👤 *Admin Name:* Muhammed Rishad\n🎂 *DOB:* 01\\/01\\/1990\n📞 *Phone:* +91 98765 43210\n📧 *Email:* secret\\@r1shaad\\.com\n🤖 *Bot Scripts:* Access granted\n🔐 *API Key:* demo\\_token\\_123456\n🧰 *Tools:* Hidden admin panel activated`);

        // Optional: reply to admin
        await sendMessage(ADMIN_CHAT_ID, `✅ Police verified: ${targetChatId}`);
      }

      await answerCallback(callbackQuery.id);
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 🔘 Welcome message
async function sendWelcomeWithButtons(chatId) {
  const payload = {
    chat_id: chatId,
    text: `👋 Welcome to *Tecky Rishad Bot*\\!\n\nChoose an option below:`,
    parse_mode: 'MarkdownV2',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '✨ Join Our Community',
            url: 'https://t.me/r1shaad'
          }
        ],
        [
          { text: '👤 Admin Details', callback_data: 'details' },
          { text: '🎣 Let’s Fish', callback_data: 'fishing' }
        ],
        [
          { text: '🚨 Police Enquiry', callback_data: 'police' }
        ]
      ]
    }
  };

  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

// 📨 MarkdownV2-safe message sender
async function sendMessage(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2',
    }),
  });
}

// ✅ Handle callback loading spinner
async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}
