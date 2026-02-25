// /api/track.js
import fetch from "node-fetch";
import crypto from "crypto";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// Simple in‑memory store for pending details (use a persistent DB in production)
const pendingDetails = new Map();
// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, { timestamp }] of pendingDetails.entries()) {
    if (now - timestamp > 10 * 60 * 1000) pendingDetails.delete(id);
  }
}, 10 * 60 * 1000);

// Country code → emoji flag
const flag = (cc = "") =>
  cc.toUpperCase().replace(/./g, (c) =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );

// Bot detection patterns
const BOT_PATTERNS = {
  userAgent: /bot|crawler|spider|scraper|headless|phantom|selenium|puppeteer|curl|wget|python|java|perl|ruby|go-http|axios|okhttp|http\/1\.|apis-google|facebookexternalhit|facebot|twitterbot|whatsapp|telegram|discordbot|slackbot|linkedinbot|pinterestbot|redditbot|tumblr|instagrambot|snapchat|tiktok|bytespider|bingpreview|slurp|duckduckbot|baiduspider|yandex|sogou|exabot|archive\.org|ia_archiver|mediapartners|adsbot|feedfetcher|applebot|googlebot|bingbot|yahoo|msnbot|teoma/i,
  isp: /amazon|aws|google|gcp|azure|microsoft|digitalocean|linode|ovh|vultr|oracle|cloudflare|hetzner|contabo|hostinger|namecheap|godaddy|bluehost|dreamhost|liquidweb|rackspace|ibm cloud|alibaba|tencent|baidu|bytedance|huawei cloud|scaleway|upcloud|brightdata|luminati|oxylabs|smartproxy|geosurf|data center|hosting|colocation|facebook|meta platforms|twitter|whatsapp|telegram|discord|reddit|pinterest|linkedin|instagram|snapchat|tiktok/i
};

const isBot = (userAgent, isp) => {
  if (BOT_PATTERNS.userAgent.test(userAgent)) return true;
  if (BOT_PATTERNS.isp.test(isp)) return true;
  return false;
};

// Send a new Telegram message
const sendTelegram = (text, extra = {}) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_ADMIN_CHAT_ID,
      text,
      parse_mode: "HTML",
      ...extra
    })
  });

// Edit an existing Telegram message
const editTelegram = (chatId, messageId, text, extra = {}) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: "HTML",
      ...extra
    })
  });

// Answer callback query (remove loading state)
const answerCallback = (callbackQueryId) =>
  fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId })
  });

export default async function handler(req, res) {
  // ---------- Handle Telegram Callback (button click) ----------
  if (req.body && req.body.callback_query) {
    const { id: callbackId, message, data } = req.body.callback_query;
    const details = pendingDetails.get(data);
    if (!details) {
      await answerCallback(callbackId);
      return res.status(200).json({ ok: true }); // ignore expired
    }

    // Build the full details message
    const fullMsg = `
🤖 <b>Bot Visitor Details</b>

${flag(details.country)} <b>${details.city}, ${details.region}, ${details.country}</b>
🏢 <b>ISP:</b> ${details.isp}
🌐 <b>IP:</b> <code>${details.ip}</code>
🔗 <b>Source:</b> ${details.referer}
🖥️ <b>User-Agent:</b> ${details.userAgent.substring(0, 100)}${details.userAgent.length > 100 ? '...' : ''}
🕒 <b>Time:</b> ${details.timeIST}
⚠️ <i>Automated/Bot Traffic Detected</i>
`;

    // Edit the original message to show full details, remove the button
    await editTelegram(message.chat.id, message.message_id, fullMsg, {
      reply_markup: { inline_keyboard: [] } // remove keyboard
    });

    await answerCallback(callbackId);
    pendingDetails.delete(data);
    return res.status(200).json({ ok: true });
  }

  // ---------- Normal Tracking Request ----------
  try {
    // Get user IP
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    const userAgent = req.headers["user-agent"] || "Unknown";

    // Fetch IP info
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then((r) => r.json())
      .catch(() => ({}));

    const city = info.city ?? "Unknown";
    const region = info.region ?? "Unknown";
    const country = info.country ?? "Unknown";
    const isp = info.org ?? "Unknown ISP";
    const referer = req.headers["referer"] || "Direct";
    const timeIST = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const botDetected = isBot(userAgent, isp);

    if (botDetected) {
      // Generate a unique ID for this visitor
      const id = crypto.randomBytes(4).toString("hex");
      // Store details with timestamp
      pendingDetails.set(id, {
        city, region, country, isp, ip, referer, userAgent, timeIST,
        timestamp: Date.now()
      });

      // Send short summary with a button
      const shortMsg = `
🤖 <b>New Bot Visitor</b>

${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🔍 <i>Click the button below for full details</i>
`;

      await sendTelegram(shortMsg, {
        reply_markup: {
          inline_keyboard: [[{ text: "🔍 View Details", callback_data: id }]]
        }
      });

    } else {
      // Human visitor – send full details immediately
      const humanMsg = `
👤 <b>New Human Visitor</b>

${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${referer}
🖥️ <b>Device:</b> ${userAgent.substring(0, 100)}${userAgent.length > 100 ? '...' : ''}
🕒 <b>Time:</b> ${timeIST}
✅ <i>Likely Human Visitor</i>
`;

      await sendTelegram(humanMsg);
    }

    return res.status(200).json({ ok: true, bot: botDetected });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
