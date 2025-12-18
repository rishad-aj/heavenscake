// /api/track.js
import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// Country code → emoji flag
const flag = (cc = "") =>
  cc.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );

// Telegram sender
const notifyTelegram = (text) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML"
    })
  });

// Datacenter / cloud ISP keywords
const DATACENTER_REGEX =
  /amazon|aws|google|gcp|azure|digitalocean|linode|ovh|vultr|oracle|cloudflare/i;

export default async function handler(req, res) {
  try {
    // Get IP
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    // Fetch IP info
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then(r => r.json())
      .catch(() => ({}));

    const city = info.city ?? "Unknown";
    const region = info.region ?? "Unknown";
    const country = info.country ?? "Unknown";
    const isp = info.org ?? "Unknown ISP";
    const referer = req.headers["referer"] || "Direct";

    // Privacy flags
    const isVPN = info.privacy?.vpn;
    const isProxy = info.privacy?.proxy;
    const isTor = info.privacy?.tor;

    // BOT detection (no UA / no headers)
    const isBot =
      DATACENTER_REGEX.test(isp) || isVPN || isProxy || isTor;

    const visitorType = isBot ? "🤖 <b>BOT</b>" : "🧑 <b>HUMAN</b>";

    const timeIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    // Telegram message
    const msg = `
👀 <b>New Visitor Alert</b>

${visitorType}
${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${referer}
🕒 <b>Time:</b> ${timeIST}
`;

    await notifyTelegram(msg);
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
