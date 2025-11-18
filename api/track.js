// track.js
import fetch from "node-fetch";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

// Helper to send a message to Telegram
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

// Main handler (for Vercel, Netlify, or Express adapt as needed)
export default async function handler(req, res) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";

    // Fetch geo info
    const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
    const geo = await geoRes.json();

    const visitor = {
      ip,
      city: geo.city || "Unknown",
      region: geo.region || "",
      country: geo.country_name || "Unknown",
      isp: geo.org || "Unknown",
      url: req.headers["referer"] || "Direct",
      userAgent: req.headers["user-agent"] || "",
      time: new Date().toISOString()
    };

    // Format Telegram message
    const message =
      `👀 <b>New Visitor Online!</b>\n` +
      `🌍 <b>${visitor.city}, ${visitor.country}</b>\n` +
      `🏢 <b>ISP:</b> ${visitor.isp}\n` +
      `🌐 <b>IP:</b> ${visitor.ip}\n` +
      `🔗 <b>Source:</b> ${visitor.url}\n` +
      `🕒 <b>Time:</b> ${visitor.time}`;

    await sendTelegramMessage(message);

    res.status(200).json({ status: "ok" });
  } catch (err) {
    console.error("TRACK ERROR:", err);
    res.status(500).json({ error: "Tracking error" });
  }
}
