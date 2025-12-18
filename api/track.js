// /api/track.js
import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// Country code → emoji flag (IN → 🇮🇳)
const flag = (cc = "") =>
  cc.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );

// 🕷️ Bot / crawler detection (User-Agent + ISP)
const detectBot = (ua = "", isp = "") => {
  const uaRegex =
    /bot|crawl|spider|facebook|whatsapp|telegram|google|bing|yandex|duckduck|baidu|slurp/i;

  const ispRegex =
    /digitalocean|aws|amazon|google cloud|gcp|azure|linode|ovh|vultr|hetzner/i;

  return uaRegex.test(ua) || ispRegex.test(isp);
};

// Telegram sender WITH STATS BUTTON
const notifyTelegram = (text) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "📊 View Stats",
              url: "https://heavenscake.vercel.app/stats"
            }
          ]
        ]
      }
    })
  });

export default async function handler(req, res) {
  try {
    /* ---------------- IP ---------------- */
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    /* ---------------- USER AGENT ---------------- */
    const ua = req.headers["user-agent"] || "Unknown";

    /* ---------------- IP INFO ---------------- */
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then((r) => r.json())
      .catch(() => ({}));

    const city = info.city ?? "Unknown";
    const region = info.region ?? "Unknown";
    const country = info.country ?? "Unknown";
    const isp = info.org ?? "Unknown ISP";
    const referer = req.headers["referer"] || "Direct";

    /* ---------------- TIME ---------------- */
    const timeIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    /* ---------------- BOT CHECK ---------------- */
    const isBot = detectBot(ua, isp);
    const visitorType = isBot
      ? "🤖 <b>Bot / Server Traffic</b>"
      : "🧑 <b>Human Visitor</b>";

    /* ---------------- MESSAGE ---------------- */
    const msg = `
👀 <b>New Visitor Alert</b>
${visitorType}

${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${referer}
🕒 <b>Time:</b> ${timeIST}
`;

    /* ---------------- SEND TELEGRAM ---------------- */
    await notifyTelegram(msg);

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
