import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

export default async function handler(req, res) {
  // 1️⃣ Get IP and location
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ?? req.socket.remoteAddress;
  const ipInfoUrl = `https://ipinfo.io/${ip}/json?token=18d2a866939a58`;

  let locationData = {};
  try {
    const response = await fetch(ipInfoUrl);
    locationData = await response.json();
  } catch {
    locationData = { city: 'Unknown', country: 'Unknown' };
  }

  // 2️⃣ Prepare data
  const timestamp = new Date().toISOString();
  const source = req.headers.referer || req.headers.origin || 'Direct / Unknown';

  const visitor = {
    ip,
    city: locationData.city || 'Unknown',
    country: locationData.country || 'Unknown',
    source,
    timestamp
  };

  // 3️⃣ Save visitor to file
  const VISITORS_PATH = path.join(process.cwd(), 'api', 'visitors.json');

  try {
    if (!fs.existsSync(VISITORS_PATH)) fs.writeFileSync(VISITORS_PATH, '[]', 'utf-8');
    const logs = JSON.parse(fs.readFileSync(VISITORS_PATH, 'utf-8'));
    logs.push(visitor);
    fs.writeFileSync(VISITORS_PATH, JSON.stringify(logs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save visitor log:', err);
  }

  // 4️⃣ Send Telegram alert
  const message = `👀 *New Visitor Online!*
🌐 IP: \`${ip}\`
📍 Location: ${visitor.city}, ${visitor.country}
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
