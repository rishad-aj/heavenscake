import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST' && req.method !== 'GET')
    return res.status(405).send('Method Not Allowed');

  const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
  const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

  // 🔹 Shared file path (same as in track.js)
  const VISITORS_PATH = path.join(process.cwd(), 'visitors.json');

  if (!fs.existsSync(VISITORS_PATH)) {
    fs.writeFileSync(VISITORS_PATH, '[]', 'utf-8');
  }

  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(VISITORS_PATH, 'utf-8'));
  } catch (e) {
    logs = [];
  }

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

  const message = `📊 *Visitor Stats*
───────────────
🧮 Total: ${stats.total}
📆 Today: ${stats.day}
📅 This Week: ${stats.week}
🗓️ This Month: ${stats.month}
📈 This Year: ${stats.year}`;

  await fetch(TELEGRAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown'
    })
  });

  res.status(200).json({ ok: true, stats });
}
