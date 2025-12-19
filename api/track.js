// /api/track.js
import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// =====================
// Helpers
// =====================

// Country code → emoji flag
const flag = (cc = "") =>
  cc.toUpperCase().replace(/./g, c =>
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

// Datacenter / cloud ISP keywords
const DATACENTER_REGEX =
  /amazon|aws|google|gcp|azure|digitalocean|linode|ovh|vultr|oracle|cloudflare/i;

// Search engines detection
const SEARCH_ENGINES = [
  { name: "Google Search", match: /google\./i },
  { name: "Bing Search", match: /bing\.com/i },
  { name: "DuckDuckGo", match: /duckduckgo\.com/i },
  { name: "Yahoo Search", match: /search\.yahoo\.com/i },
  { name: "Yandex Search", match: /yandex\./i }
];

export default async function handler(req, res) {
  try {
    // =====================
    // 1. IP Address
    // =====================
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "Unknown";

    // =====================
    // 2. IP Info
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
    // 3. Referrer
    // =====================
    const referer = req.headers.referer || "";

    // =====================
    // 4. UTM parameters (TOP PRIORITY)
    // =====================
    const {
      utm_source,
      utm_medium,
      utm_campaign
    } = req.query;

    // =====================
    // 5. Source Detection Logic
    // =====================
    let source = "Direct";

    // UTM overrides everything
    if (utm_source) {
      source = `UTM: ${utm_source}${utm_medium ? ` / ${utm_medium}` : ""}${
        utm_campaign ? ` / ${utm_campaign}` : ""
      }`;
    }
    // Search engines
    else if (referer) {
      const engine = SEARCH_ENGINES.find(se =>
        se.match.test(referer)
      );
      source = engine ? engine.name : referer;
    }

    // =====================
    // 6. User-Agent
    // =====================
    const userAgent = req.headers["user-agent"] || "Unknown";

    // =====================
    // 7. Bot / VPN Detection
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
    // 8. Time (IST)
    // =====================
    const timeIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    // =====================
    // 9. Telegram message
    // =====================
    const msg = `
👀 <b>New Visitor Alert</b>

${visitorType}
${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${source}
🧭 <b>User-Agent:</b> ${userAgent}
🕒 <b>Time:</b> ${timeIST}
`;

    // Bots = silent
    await notifyTelegram(msg, isBot);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
