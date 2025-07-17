// 🔐 Real credentials
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
  const text = message?.text;
  const callbackQuery = body.callback_query;
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
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [
                { text: `✅ Verify [${chatId}]`, callback_data: `verify_${chatId}` },
                { text: `❌ Deny [${chatId}]`, callback_data: `deny_${chatId}` }
              ]
            ]
          }
        })
      });

      await sendMessageNoMarkdown(chatId, `📤 Your ID has been received.\n🕵️‍♂️ It is under verification.\nPlease be patient while our admin reviews it.`);
      return res.status(200).send('OK');
    }

    if (callbackQuery) {
      const data = callbackQuery.data;
      const fromChatId = message.chat.id.toString();
      const isAdmin = fromChatId === ADMIN_CHAT_ID;

      if (data === 'police') {
        await sendMessageNoMarkdown(
          fromChatId,
          `🛂 *Police Verification Required*\n\n📸 Please send a clear photo of your Police ID.\nOur admin will verify and give you access to confidential resources.`
        );
      } else if (data === 'details') {
        await sendMessageNoMarkdown(
          fromChatId,
          `👤 Admin Contact:\n\n📨 Telegram: @mohdrishad\n🌐 Website: https://teckybot.vercel.app`
        );
      } else if (data === 'fishing') {
        await sendMessageNoMarkdown(
          fromChatId,
          `🎣 Let’s Fish!\n\nWelcome to fishing mode! You’ll soon unlock hidden resources 🐟`
        );
      } else if (data.startsWith('verify_') && isAdmin) {
        const targetChatId = data.split('_')[1];
        policeRequests.set(Number(targetChatId), { verified: true });
        pendingPoliceQueries.set(Number(targetChatId), true);

        const safeText = `✅ *You have been verified as a police officer\\!*\\n\\nNow, please *describe the details* you need\\.\\n\\nExample: "Need admin’s contact and bot access info\\."`;

        await sendMessage(targetChatId, safeText);
        await sendMessage(ADMIN_CHAT_ID, `✅ Police verified: ${targetChatId}`);
      } else if (data.startsWith('deny_') && isAdmin) {
        const targetChatId = data.split('_')[1];
        await sendMessage(targetChatId, `❌ Your police verification was denied.\nYou may try again if needed.`);
        await sendMessage(ADMIN_CHAT_ID, `❌ Denied verification for user: ${targetChatId}`);
      } else if (data.startsWith('answer_') && isAdmin) {
        const targetChatId = data.split('_')[1];
        awaitingAdminResponse.set(fromChatId, targetChatId);

        await sendMessageNoMarkdown(
          ADMIN_CHAT_ID,
          `✍️ Describe your answer below for [User ID: ${targetChatId}]`
        );
      }

      await answerCallback(callbackQuery.id);
      return res.status(200).send('OK');
    }

    if (text && policeRequests.has(chatId) && policeRequests.get(chatId).verified && pendingPoliceQueries.get(chatId)) {
      pendingPoliceQueries.delete(chatId);

      const escapedText = text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

      const forwardMsg = `📤 *Police Request Forwarded*\nFrom: [User ID: ${chatId}]\n\n📄 Message:\n${escapedText}`;

      await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: ADMIN_CHAT_ID,
          text: forwardMsg,
          parse_mode: 'MarkdownV2',
          reply_markup: {
            inline_keyboard: [
              [{ text: '✍️ Answer', callback_data: `answer_${chatId}` }]
            ]
          }
        })
      });

      await sendMessageNoMarkdown(chatId, `✅ Your enquiry has been received.\nThe admin will reply shortly.`);
      return res.status(200).send('OK');
    }

    // 🔄 UPDATED: Admin replies + follow-up message with contact
    if (
      text &&
      chatId.toString() === ADMIN_CHAT_ID &&
      awaitingAdminResponse.has(chatId)
    ) {
      const targetChatId = awaitingAdminResponse.get(chatId);
      awaitingAdminResponse.delete(chatId);

      if (targetChatId) {
        const escapedReply = text.replace(/([_*[\]()~`>#+\-=|{}.!\\])/g, '\\$1');

        const fullReply = `📨 *Admin has responded:*\n\n${escapedReply}\n\n📬 *For more details, please contact the admin directly:* [@mohdrishad](https://t.me/mohdrishad)\n\n🙏 *Thank you!*`;

        await sendMessage(targetChatId, fullReply);
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

async function sendWelcomeWithButtons(chatId) {
  await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
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
    })
  });
}

async function sendMessage(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2'
    })
  });
}

async function sendMessageNoMarkdown(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message })
  });
}

async function sendForceReply(chatId, message) {
  return fetch(`${TELEGRAM_API_URL}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: 'MarkdownV2',
      reply_markup: { force_reply: true }
    })
  });
}

async function answerCallback(callbackQueryId) {
  return fetch(`${TELEGRAM_API_URL}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });
}
