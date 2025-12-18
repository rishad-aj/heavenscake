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

    // Detect source from referer (Google, Bing, etc.)
    let source = "Direct / Unknown";
    if (referer.includes("google.")) source = "Google Search";
    else if (referer.includes("bing.com")) source = "Bing Search";
    else if (referer.includes("yahoo.com")) source = "Yahoo Search";
    else if (referer.includes("duckduckgo.com")) source = "DuckDuckGo";
    else if (referer.includes("baidu.com")) source = "Baidu";
    else if (referer.includes("yandex.com")) source = "Yandex";
    else source = referer;

    // Privacy flags
    const isVPN = info.privacy?.vpn;
    const isProxy = info.privacy?.proxy;
    const isTor = info.privacy?.tor;

    // BOT detection (NO UA / NO signals)
    let isBot = false;
    let reasons = [];

    if (DATACENTER_REGEX.test(isp)) {
      isBot = true;
      reasons.push("Datacenter ISP");
    }

    if (isVPN || isProxy || isTor) {
      isBot = true;
      reasons.push("VPN / Proxy / Tor");
    }

    const visitorType = isBot ? "🤖 <b>BOT</b>" : "🧑 <b>HUMAN</b>";
    const reasonText = reasons.length
      ? `⚠️ <b>Reason:</b> ${reasons.join(", ")}`
      : "✅ <b>Reason:</b> Residential / Mobile network";

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
🔗 <b>Source:</b> ${source}
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
