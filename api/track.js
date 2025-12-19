import fetch from "node-fetch";

const { TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID } = process.env;
const IPINFO_TOKEN = "682ccb93069577";

const flag = (cc = "") =>
  cc.toUpperCase().replace(/./g, c =>
    String.fromCodePoint(c.charCodeAt(0) + 127397)
  );

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

const DATACENTER_REGEX =
  /amazon|aws|google|gcp|azure|digitalocean|linode|ovh|vultr|oracle|cloudflare/i;

const SEARCH_ENGINES = [
  { name: "Google Search", match: /google\./i },
  { name: "Bing Search", match: /bing\.com/i },
  { name: "DuckDuckGo", match: /duckduckgo\.com/i },
  { name: "Yahoo Search", match: /search\.yahoo\.com/i },
  { name: "Yandex Search", match: /yandex\./i }
];

export default async function handler(req, res) {
  try {
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.headers["x-real-ip"] ||
      req.socket?.remoteAddress ||
      "Unknown";

    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`)
      .then(r => r.json())
      .catch(() => ({}));

    const city = info.city || "Unknown";
    const region = info.region || "Unknown";
    const country = info.country || "Unknown";
    const isp = info.org || "Unknown ISP";

    const referer = req.headers.referer || "";

    const { utm_source, utm_medium, utm_campaign } = req.query;

    let source = "Direct";

    if (utm_source) {
      source = `UTM: ${utm_source}${
        utm_medium ? ` / ${utm_medium}` : ""
      }${utm_campaign ? ` / ${utm_campaign}` : ""}`;
    } else if (referer) {
      const engine = SEARCH_ENGINES.find(se =>
        se.match.test(referer)
      );
      source = engine ? engine.name : referer;
    }

    const isVPN = info.privacy?.vpn;
    const isProxy = info.privacy?.proxy;
    const isTor = info.privacy?.tor;

    const isBot =
      DATACENTER_REGEX.test(isp) ||
      isVPN ||
      isProxy ||
      isTor;

    const visitorType = isBot
      ? "🤖 <b>BOT detected</b>"
      : "🧑 <b>HUMAN visitor</b>";

    const timeIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata"
    });

    const msg = `
👀 <b>New Visitor Alert</b>

${visitorType}
${flag(country)} <b>${city}, ${region}, ${country}</b>
🏢 <b>ISP:</b> ${isp}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${source}
🕒 <b>Time:</b> ${timeIST}
`;

    await notifyTelegram(msg, isBot);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("TRACK ERROR:", err);
    return res.status(500).json({ error: "track_failed" });
  }
}
