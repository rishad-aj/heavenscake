// /api/track.js

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
const VISITORS_PATH = path.resolve('api/visitors.json');

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0] ?? req.socket.remoteAddress;
  const ipInfoUrl = `https://ipinfo.io/${ip}/json?token=18d2a866939a58`;

  let locationData = {};
  try {
    const response = await fetch(ipInfoUrl);
    locationData = await response.json();
  } catch (err) {
    locationData = { city: 'Unknown', country: 'Unknown' };
  }

  const timestamp = new Date().toISOString();
  const visitor = {
    ip,
    city: locationData.city,
    country: locationData.country,
    timestamp,
  };

  // Load & update log
  let logs = [];
  try {
    logs = JSON.parse(fs.readFileSync(VISITORS_PATH, 'utf-8'));
  } catch (e) {
    logs = [];
  }
  logs.push(visitor);
  fs.writeFileSync(VISITORS_PATH, JSON.stringify(logs, null, 2));

  // Send Telegram message
  const message = `👀 *New Visitor Online!*
🌐 IP: \`${ip}\`
📍 Location: ${locationData.city}, ${locationData.country}
🕒 Time: ${timestamp}`;

  await fetch(TELEGRAM_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: message,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          {
            text: "📊 Show Stats",
            callback_data: "/start"
          }
        ]]
      }
    })
  });

  res.status(200).json({ ok: true });
}
