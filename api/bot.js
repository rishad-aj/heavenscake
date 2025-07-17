// 🔐 Real credentials — DO NOT share this publicly!
const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const policeRequests = new Map();
const pendingPoliceQueries = new Map();
const awaitingAdminResponse = new Map();

export default async function handler(req, res) {
  if (req.method === 'GET') return res.status(200).send('🟢 Bot is alive!');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const body = req.body;
  const message = body.message || body.callback_query?.message;
  const chatId = message?.chat?.id;
  const text = message?.text?.trim();
  const callbackQuery = body.callback_query;
  const photo = message?.photo;

  try {
    // ✅ Start command
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
      return res.status(200).send('OK');
    }

    // 📸 Handle Police ID photo
    if (photo && chatId.toString() !== ADMIN_CHAT_ID) {
      const fileId = photo[photo.length - 1].file_id;
      policeRequests.set(chatId, { verified: false });

      const caption = `📸 *Police ID Submitted*\nFrom: [User ID: ${chatId}]`;

      await sendTelegram('sendPhoto', {
        chat_id: ADMIN_CHAT_ID,
        photo: fileId,
        caption,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [
              { text: `✅ Verify [${chatId}]`, callback_data: `verify_${chatId}` },
              { text: `❌ Deny [${chatId}]`, callback_data: `deny_${chatId}` }
            ]
          ]
        }
      });

      await sendMessage(chatId, `🕵️‍♂️ Your ID is under verification.\nPlease be patient while our admin reviews it.`);
      return res.status(200).send('OK');
    }

    // 🔘 Handle inline button clicks
    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = message.chat.id.toString();
      const isAdmin = fromChatId === ADMIN_CHAT_ID;

      if (data === 'police') {
        await sendMessageNoMarkdown(fromChatId, `🛂 *Police Verification Required*\n\n📸 Please send a clear photo of your Police ID.\nOur admin will verify and give you access to confidential resources.`);
      } else if (data.startsWith('verify_') && isAdmin) {
        const targetChatId = data.split('_')[1];
        policeRequests.set(Number(targetChatId), { verified: true });
        pendingPoliceQueries.set(Number(targetChatId), true);

        await sendMessage(targetChatId, `✅ *You have been verified as a police officer\\!*\n\nNow, please *describe the details* you need.\n\nExample: "Need admin’s contact and bot access info."`);
        await sendMessage(ADMIN_CHAT_ID, `✅ Police verified: ${targetChatId}`);
      } else if (data.startsWith('deny_') && isAdmin) {
        const targetChatId = data.split('_')[1];
        await sendMessage(targetChatId, `❌ Your police verification was denied.\nYou may try again if needed.`);
        await sendMessage(ADMIN_CHAT_ID, `❌ Denied verification for user: ${targetChatId}`);
      } else if (data.startsWith('answer_') && isAdmin) {
        const targetChatId = data.split('_')[1];
        awaitingAdminResponse.set(fromChatId, targetChatId);

        await sendForceReply(ADMIN_CHAT_ID, `✍️ Leave your answer for [${targetChatId}] below.`);
      }

      await answerCallback(callbackQuery.id);
      return res.status(200).send('OK');
    }

    // 📝 Verified police submitting a request
    if (text && policeRequests.has(chatId) && policeRequests.get(chatId).verified && pendingPoliceQueries.get(chatId)) {
      pendingPoliceQueries.delete(chatId);

      const forwardMsg = `📤 *Police Request Forwarded*\nFrom: [User ID: ${chatId}]\n\n📄 Message:\n${text}`;

      await sendTelegram('sendMessage', {
        chat_id: ADMIN_CHAT_ID,
        text: forwardMsg,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [{ text: '✍️ Answer', callback_data: `answer_${chatId}` }]
          ]
        }
      });

      await sendMessage(chatId, `📡 Your message has been forwarded to the admin.\nPlease wait for a response.`);
      return res.status(200).send('OK');
    }

    // 📩 Admin replies using force reply
    if (text && chatId.toString() === ADMIN_CHAT_ID && message?.reply_to_message?.text?.includes('Leave your answer')) {
      const targetChatId = awaitingAdminResponse.get(chatId);
      if (targetChatId) {
        awaitingAdminResponse.delete(chatId);

        await sendMessage(targetChatId, `📨 *Admin has responded:*\n\n${text}\n\n🔗 [Contact Admin](https://t.me/mohdrishad)`);
        await sendMessage(chatId, `✅ Message delivered to [${targetChatId}]`);
      }
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
  await sendTelegram('sendMessage', {
    chat_id: chatId,
    text: '👋 Welcome to *Tecky Rishad Bot*\\!\n\nChoose an option below:',
    parse_mode: 'MarkdownV2',
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
  });
}

// 📬 Unified Telegram API sender
async function sendTelegram(endpoint, payload) {
  return fetch(`${TELEGRAM_API_URL}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

// 📤 Send markdown message
async function sendMessage(chatId, message) {
  return sendTelegram('sendMessage', {
    chat_id: chatId,
    text: message,
    parse_mode: 'MarkdownV2'
  });
}

// 📤 Send plain message
async function sendMessageNoMarkdown(chatId, message) {
  return sendTelegram('sendMessage', {
    chat_id: chatId,
    text: message
  });
}

// 🖊️ Force admin to reply
async function sendForceReply(chatId, message) {
  return sendTelegram('sendMessage', {
    chat_id: chatId,
    text: message,
    parse_mode: 'MarkdownV2',
    reply_markup: { force_reply: true }
  });
}

// ✅ Answer callback
async function answerCallback(callbackQueryId) {
  return sendTelegram('answerCallbackQuery', {
    callback_query_id: callbackQueryId
  });
}
