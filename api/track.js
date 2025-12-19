// /api/track.js
import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// Country code → emoji flag
const flag = (cc = "") =>
  cc
    .toUpperCase()
    .replace(/./g, c =>
      String.fromCodePoint(c.charCodeAt(0) + 127397)
    );

// Telegram sender
const notifyTelegram = (text, silent = false) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_notification: silent
    })
  });

// Datacenter / cloud ISP detection
const DATACENTER_REGEX =
  /amazon|aws|google|gcp|azure|digitalocean|linode|ovh|vultr|oracle|cloudflare/i;

export default async function handler(req, res) {
  try {
    // =====================
    // 1. Get IP
    // =====================
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "Unknown";

    // =====================
    // 2. IP Info lookup
    // =====================
    const info = await fetch(
      `https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`
    )
      .then(r => r.json())
      .catch(() => ({}));

    const city = info.city || "Unknown";
    const region = info.region || "Unknown";
    const country = info.country || "Unknown";
    const isp = info.org || "Unknown ISP";

    // =====================
    // 3. Traffic Source
    // =====================
    const referer = req.headers.referer || "Direct";

    // =====================
    // 4. UTM Parameters (CRITICAL)
    // =====================
    const {
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content
    } = req.query;

    const utmInfo =
      utm_source || utm_medium || utm_campaign
        ? `${utm_source || "?"} / ${utm_medium || "?"} / ${
            utm_campaign || "?"
          }`
        : "None";

    // =====================
    // 5. User Agent
    // =====================
    const userAgent = req.headers["user-agent"] || "Unknown";

    // =====================
    // 6. Privacy / Bot detection
    // =====================
    const isVPN = info.privacy?.vpn;
    const isProxy = info.privacy?.proxy;
    const isTor = info.privacy?.tor;

    const isBot =
      DATACENTER_REGEX.test(isp) ||
      isVPN ||
      isProxy ||
      isTor ||
      !userAgent;

    const visitorType = isBot
      ? "🤖 <b>BOT detected</b>"
      : "🧑 <b>HUMAN visitor</b>";

    // =====================
    // 7. Time (IST)
    // =====================
    const timeIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    // =====================
    // 8. Telegram message
    // =====================
    const msg = `
👀 <b>New Visitor Alert</b>

${visitorType}
${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Referrer:</b> ${referer}
📢 <b>UTM:</b> ${utmInfo}
🧭 <b>User-Agent:</b> ${userAgent}
🕒 <b>Time:</b> ${timeIST}
`;

    // Send bots silently
    await notifyTelegram(msg, isBot);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
