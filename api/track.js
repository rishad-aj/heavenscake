// /api/track.js
import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

// Country flag
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

// Datacenter ISP check
const DATACENTER_REGEX =
  /amazon|aws|google|gcp|azure|digitalocean|linode|ovh|vultr|oracle|cloudflare/i;

// Google-only source detection
const getSource = (referer = "") => {
  if (!referer) return "Direct / Other";
  if (referer.includes("google.")) return "Google Search";
  return "Direct / Other";
};

export default async function handler(req, res) {
  try {
    // IP
    const ip =
      req.headers["x-real-ip"] ||
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket?.remoteAddress ||
      "Unknown";

    const referer = req.headers["referer"] || "";

    // IP info
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then(r => r.json())
      .catch(() => ({}));

    const city = info.city ?? "Unknown";
    const region = info.region ?? "Unknown";
    const country = info.country ?? "Unknown";
    const isp = info.org ?? "Unknown ISP";

    // Privacy flags
    const isVPN = info.privacy?.vpn;
    const isProxy = info.privacy?.proxy;
    const isTor = info.privacy?.tor;

    // BOT detection (ISP + privacy only)
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

    const source = getSource(referer);

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
🔍 <b>Source:</b> ${source}
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
