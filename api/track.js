// /api/track.js
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const IPINFO_TOKEN = "682ccb93069577";

// Convert "IN" → "🇮🇳"
const flag = cc =>
  cc ? cc.toUpperCase().replace(/./g, c => String.fromCodePoint(c.charCodeAt(0) + 127397)) : "";

// Send text to Telegram
const notifyTelegram = (text) =>
  fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: "HTML" })
  });

export default async function handler(req, res) {
  try {
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";

    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`).then(r => r.json());

    const msg =
      `👀 <b>New Visitor Online!</b>\n` +
      `${flag(info.country)} <b>${info.city || "Unknown"}, ${info.region || "Unknown"}, ${info.country || "Unknown"}</b>\n` +
      `🏢 <b>ISP:</b> ${info.org || "Unknown ISP"}\n` +
      `🌐 <b>IP:</b> <code>${ip}</code>\n` +
      `🔗 <b>Source:</b> ${req.headers["referer"] || "Direct"}\n` +
      `🕒 <b>Time:</b> ${new Date().toISOString()}`;

    await notifyTelegram(msg);
    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    res.status(500).json({ error: "track_failed" });
  }
}
