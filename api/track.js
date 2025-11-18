// /api/track.js
import fetch from "node-fetch";

// Telegram ENV
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// IPInfo token (NO ENV for this)
const IPINFO_TOKEN = "682ccb93069577";

// Convert "IN" → "🇮🇳"
function countryToEmoji(countryCode) {
  if (!countryCode) return "";
  return countryCode
    .toUpperCase()
    .replace(/./g, char =>
      String.fromCodePoint(char.charCodeAt(0) + 127397)
    );
}

async function sendTelegramMessage(text) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML"
    })
  });
}

export default async function handler(req, res) {
  try {
    // Extract real IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";

    // Query IPInfo
    const ipInfoRes = await fetch(
      `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
    );
    const info = await ipInfoRes.json();

    const flag = countryToEmoji(info.country);

    const visitor = {
      ip,
      city: info.city || "Unknown",
      region: info.region || "Unknown",
      country: info.country || "Unknown",
      flag,
      isp: info.org || "Unknown ISP",
      url: req.headers["referer"] || "Direct",
      time: new Date().toISOString()
    };

    // --- Telegram Message Format ---
    const message =
      `👀 <b>New Visitor Online!</b>\n` +
      `${visitor.flag} <b>${visitor.city}, ${visitor.region}, ${visitor.country}</b>\n` +
      `🏢 <b>ISP:</b> ${visitor.isp}\n` +
      `🌐 <b>IP:</b> <code>${visitor.ip}</code>\n` + // IP is COPYABLE
      `🔗 <b>Source:</b> ${visitor.url}\n` +
      `🕒 <b>Time:</b> ${visitor.time}`;

    await sendTelegramMessage(message);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("TRACK ERROR:", err.message);
    res.status(500).json({ error: "Tracking failed" });
  }
}
