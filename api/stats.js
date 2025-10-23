import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET')
    return res.status(405).send('Method Not Allowed');

  // 🔹 Fetch logs from jsonbin.io
  let logs = [];
  try {
    const resBin = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_API_KEY }
    });
    const data = await resBin.json();
    if (Array.isArray(data.record)) {
      logs = data.record;
    } else if (data.record?.visitors) {
      logs = data.record.visitors;
    }
  } catch (err) {
    logs = [];
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  // Start of week in UTC
  const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));

  const stats = {
    total: logs.length,
    day: logs.filter(v => v.timestamp?.startsWith(today)).length,
    week: logs.filter(v => new Date(v.timestamp) >= weekStart).length,
    month: logs.filter(v => new Date(v.timestamp).getUTCMonth() === now.getUTCMonth()).length,
    year: logs.filter(v => new Date(v.timestamp).getUTCFullYear() === now.getUTCFullYear()).length
  };

  const message = `📊 *Visitor Stats*
───────────────
🧮 Total: ${stats.total}
📆 Today: ${stats.day}
📅 This Week: ${stats.week}
🗓️ This Month: ${stats.month}
📈 This Year: ${stats.year}`;

  // 🔹 Send stats to Telegram
  if (TELEGRAM_TOKEN && CHAT_ID) {
    await fetch(TELEGRAM_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });
  }

  res.status(200).json({ ok: true, stats });
}
