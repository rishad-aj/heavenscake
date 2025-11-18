// /api/track.js
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Your direct IPInfo token (NO ENV)
const IPINFO_TOKEN = "682ccb93069577";

// --- Helper to send Telegram messages ---
async function sendTelegramMessage(text) {
  const telegramURL = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(telegramURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML"
    })
  });
}

// --- Main tracking handler ---
export default async function handler(req, res) {
  try {
    // Extract visitor IP
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";

    // Get location from IPINFO
    const ipInfoRes = await fetch(
      `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
    );
    const info = await ipInfoRes.json();

    const data = {
      ip,
      city: info.city || "Unknown",
      region: info.region || "Unknown",
      country: info.country || "Unknown",
      org: info.org || "Unknown ISP",
      loc: info.loc || "",
      url: req.headers["referer"] || "Direct",
      time: new Date().toISOString()
    };

    // Format Telegram message
    const message =
      `👀 <b>New Visitor Online!</b>\n` +
      `🌍 <b>${data.city}, ${data.country}</b>\n` +
      `🏢 <b>ISP:</b> ${data.org}\n` +
      `🌐 <b>IP:</b> ${data.ip}\n` +
      `🔗 <b>Source:</b> ${data.url}\n` +
      `🕒 <b>Time:</b> ${data.time}`;

    await sendTelegramMessage(message);

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("TRACK ERROR:", err);
    res.status(500).json({ error: "track-failed" });
  }
}
