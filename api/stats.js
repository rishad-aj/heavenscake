// /api/stats.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch'; // required if Node <18

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET')
    return res.status(405).send('Method Not Allowed');

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  // 🔹 Use correct absolute path
  const VISITORS_PATH = path.join(process.cwd(), 'api', 'visitors.json');

  // 🔹 Ensure file exists
  if (!fs.existsSync(VISITORS_PATH)) {
    fs.writeFileSync(VISITORS_PATH, '[]', 'utf-8');
  }

  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(VISITORS_PATH, 'utf-8'));
  } catch (e) {
    logs = [];
  }

  // 🔹 Calculate stats
  const now = new Date();
  const getCount = (filterFn) => logs.filter(filterFn).length;

  const today = now.toISOString().slice(0, 10);
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());

  const stats = {
    total: logs.length,
    day: getCount(v => v.timestamp?.startsWith(today)),
    week: getCount(v => new Date(v.timestamp) >= weekStart),
    month: getCount(v => new Date(v.timestamp).getMonth() === now.getMonth()),
    year: getCount(v => new Date(v.timestamp).getFullYear() === now.getFullYear())
  };

  // 🔹 Format message
  const message = `📊 *Visitor Stats*
───────────────
🧮 Total: ${stats.total}
📆 Today: ${stats.day}
📅 This Week: ${stats.week}
🗓️ This Month: ${stats.month}
📈 This Year: ${stats.year}`;

  // 🔹 Send Telegram message
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
  } else {
    console.warn('⚠️ Telegram credentials missing');
  }

  // 🔹 Respond to browser
  res.status(200).json({ ok: true, stats });
}
