import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

// Convert country code to flag emoji
const getFlagEmoji = (countryCode) =>
  countryCode
    ? String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 127397 + c.charCodeAt()))
    : '🏳️';

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ?? req.socket.remoteAddress;
  const ipInfoUrl = `https://ipinfo.io/${ip}/json?token=18d2a866939a58`;

  let locationData = {};
  try {
    const response = await fetch(ipInfoUrl);
    locationData = await response.json();
  } catch {
    locationData = { city: 'Unknown', country: 'Unknown', org: 'Unknown' };
  }

  const timestamp = new Date().toISOString();
  const source = req.headers.referer || req.headers.origin || 'Direct / Unknown';

  const visitor = {
    ip,
    city: locationData.city || 'Unknown',
    country: locationData.country || 'Unknown',
    isp: locationData.org || 'Unknown',
    source,
    timestamp
  };

  // 🔹 Fetch current logs
  let logs = [];
  try {
    const resBin = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const data = await resBin.json();
    logs = data.record?.visitors || [];
  } catch (err) {
    logs = [];
  }

  logs.push(visitor);

  // 🔹 Save updated logs back to jsonbin
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY,
      'X-Bin-Versioning': 'false'
    },
    body: JSON.stringify({ visitors: logs })
  });

  // 🔹 Telegram message
  const flag = getFlagEmoji(visitor.country);
  const message = `👀 *New Visitor Online!*
${flag} ${visitor.city}, ${visitor.country}
🏢 ISP: ${visitor.isp}
🌐 IP: \`${ip}\`
🔗 Source: ${visitor.source}
🕒 Time: ${timestamp}`;

  if (TELEGRAM_TOKEN && CHAT_ID) {
    await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: "📊 Show Stats", callback_data: "/start" }]]
        }
      })
    });
  }

  res.status(200).json({ ok: true });
}
