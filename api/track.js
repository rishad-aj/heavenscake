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

// BOT heuristics
const BOT_UA_REGEX =
  /bot|crawl|spider|slurp|headless|curl|wget|python|node|axios|fetch|httpclient|phantom|selenium|puppeteer/i;

const BOT_ISP_REGEX =
  /amazon|aws|google|gcp|azure|digitalocean|linode|ovh|vultr|oracle|cloudflare/i;

export default async function handler(req, res) {
  try {
    // IP
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    const ua = req.headers["user-agent"] || "Unknown";
    const referer = req.headers["referer"] || "Direct";
    const acceptLang = req.headers["accept-language"];

    // IP info
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then(r => r.json())
      .catch(() => ({}));

    const city = info.city ?? "Unknown";
    const region = info.region ?? "Unknown";
    const country = info.country ?? "Unknown";
    const isp = info.org ?? "Unknown ISP";

    // Privacy flags (if available)
    const isProxy = info.privacy?.proxy;
    const isVPN = info.privacy?.vpn;
    const isTor = info.privacy?.tor;

    // BOT detection logic
    let isBot = false;
    let botReasons = [];

    if (BOT_UA_REGEX.test(ua)) {
      isBot = true;
      botReasons.push("Suspicious User-Agent");
    }

    if (BOT_ISP_REGEX.test(isp)) {
      isBot = true;
      botReasons.push("Datacenter ISP");
    }

    if (!acceptLang) {
      isBot = true;
      botReasons.push("Missing Accept-Language");
    }

    if (isProxy || isVPN || isTor) {
      isBot = true;
      botReasons.push("Proxy/VPN/Tor");
    }

    const visitorType = isBot ? "🤖 <b>BOT</b>" : "🧑 <b>HUMAN</b>";
    const reasonText = botReasons.length
      ? `⚠️ <b>Signals:</b> ${botReasons.join(", ")}`
      : "✅ <b>Signals:</b> Normal browser behavior";

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
🧭 <b>User-Agent:</b> ${ua}
🔗 <b>Source:</b> ${referer}
${reasonText}
🕒 <b>Time:</b> ${timeIST}
`;

    await notifyTelegram(msg);
    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
