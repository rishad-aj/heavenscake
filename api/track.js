
// /api/track.js
import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// Country code → emoji flag (IN → 🇮🇳)
const flag = (cc = "") =>
  cc.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );

// Bot detection patterns
const BOT_PATTERNS = {
  userAgent: /bot|crawler|spider|scraper|headless|phantom|selenium|puppeteer|curl|wget|python|java|perl|ruby|go-http|axios|okhttp|http\/1\.|apis-google|facebookexternalhit|facebot|twitterbot|whatsapp|telegram|discordbot|slackbot|linkedinbot|pinterestbot|redditbot|tumblr|instagrambot|snapchat|tiktok|bytespider|bingpreview|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|archive\.org|ia_archiver|mediapartners|adsbot|feedfetcher|applebot|googlebot|bingbot|yahoo|msnbot|teoma/i,
  
  isp: /amazon|aws|google|gcp|azure|microsoft|digitalocean|linode|ovh|vultr|oracle|cloudflare|hetzner|contabo|hostinger|namecheap|godaddy|bluehost|dreamhost|liquidweb|rackspace|ibm cloud|alibaba|tencent|baidu|bytedance|huawei cloud|scaleway|upcloud|brightdata|luminati|oxylabs|smartproxy|geosurf|data center|hosting|colocation|facebook|meta platforms|twitter|whatsapp|telegram|discord|reddit|pinterest|linkedin|instagram|snapchat|tiktok/i
};

// Check if visitor is a bot
const isBot = (userAgent, isp) => {
  if (BOT_PATTERNS.userAgent.test(userAgent)) return true;
  if (BOT_PATTERNS.isp.test(isp)) return true;
  return false;
};

// Telegram sender (reused)
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

export default async function handler(req, res) {
  try {
    // Get user IP
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    // Get User-Agent
    const userAgent = req.headers["user-agent"] || "Unknown";

    // Fetch IP info
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then((r) => r.json())
      .catch(() => ({}));

    // Quick variables
    const city = info.city ?? "Unknown";
    const region = info.region ?? "Unknown";
    const country = info.country ?? "Unknown";
    const isp = info.org ?? "Unknown ISP";
    const referer = req.headers["referer"] || "Direct";
    const timeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    // Bot detection
    const botDetected = isBot(userAgent, isp);
    
    // Message based on visitor type
    const msg = botDetected
      ? `
🤖 <b>New Bot Visitor</b>

${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${referer}
🖥️ <b>User-Agent:</b> ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}
🕒 <b>Time:</b> ${timeIST}
⚠️ <i>Automated/Bot Traffic Detected</i>
`
      : `
👤 <b>New Human Visitor</b>

${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${referer}
🖥️ <b>Device:</b> ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}
🕒 <b>Time:</b> ${timeIST}
✅ <i>Likely Human Visitor</i>
`;

    // Send to Telegram
    await notifyTelegram(msg);

    return res.status(200).json({ ok: true, bot: botDetected });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
