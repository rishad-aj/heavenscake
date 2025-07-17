// 🔐 Real credentials
const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const policeRequests = new Map();
const pendingPoliceQueries = new Map();
let lastPoliceUser = null;

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('🟢 Bot is alive!');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = message?.text;
  const photo = message?.photo;

  try {
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
      return res.status(200).send('OK');
    }

    if (photo && chatId.toString() !== ADMIN_CHAT_ID) {
      const fileId = photo[photo.length - 1].file_id;
      policeRequests.set(chatId, { verified: false });

      const caption = `📸 *Police ID Submitted*\nFrom: [User ID: ${chatId}]`;

      await fetch(`${TELEGRAM_API_URL}/sendPhoto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          photo: fileId,
          caption,
          parse_mode: 'MarkdownV2'
        })
      });

      await sendMessageNoMarkdown(chatId, `📤 Your ID has been received.\n🕵️‍♂️ It is under verification.\nPlease be patient while our admin reviews it.`);
      return res.status(200).send('OK');
    }

    // Handle police message
    if (text && chatId.toString() !== ADMIN_CHAT_ID) {
      // Store last police user
      lastPoliceUser = chatId;

      const forwardMsg = `📤 Police Request Forwarded\nFrom: [User ID: ${chatId}]\nMessage: ${text}`;

      await sendMessageNoMarkdown(ADMIN_CHAT_ID, forwardMsg);
      await sendMessageNoMarkdown(chatId, `✅ Your enquiry has been received.\nThe admin will reply shortly.`);
      return res.status(200).send('OK');
    }

    // Handle admin reply
    if (text && chatId.toString() === ADMIN_CHAT_ID && lastPoliceUser) {
      await sendMessageNoMarkdown(lastPoliceUser, `📨 Admin has responded:\n\n${text}`);
      await sendMessageNoMarkdown(lastPoliceUser, `📬 For more help, contact the admin directly: @mohdrishad`);
      await sendMessageNoMarkdown(ADMIN_CHAT_ID, `✅ Your message has been sent to the police.`);
      return res.status(200).send('OK');
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Bot Error:', err);
    res.status(500).send('Internal Server Error');
  }
}

// 🔘 Welcome screen with inline buttons
async function sendWelcomeWithButtons(chatId) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: '👋 Welcome to Tecky Rishad Bot!\n\nChoose an option below:',
      reply_markup: {
        inline_keyboard: [
          [{ text: '✨ Join Our Community', url: 'https://t.me/r1shaad' }],
          [
            { text: '👤 Admin Details', callback_data: 'details' },
            { text: '🎣 Let’s Fish', callback_data: 'fishing' }
          ],
          [{ text: '🚨 Police Enquiry', callback_data: 'police' }]
        ]
      }
    })
  });
}

// 📬 Basic sender
async function sendMessageNoMarkdown(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}
