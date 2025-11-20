import { getStats, updateStats } from "./stats.js";

export default async function handler(req, res) {
  try {
    const ip = req.headers["x-real-ip"] || req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
    
    // Fetch user IP info
    const info = await fetch(`https://ipinfo.io/${ip}?token=${IPINFO_TOKEN}`).then(r => r.json());

    // Load stats
    let stats = await getStats();

    const today = new Date().toISOString().slice(0, 10);

    // Reset daily stats if new day
    if (stats.lastDay !== today) {
      stats.day = 0;
      stats.lastDay = today;
    }

    stats.total++;
    stats.day++;

    await updateStats(stats);

    // Send visitor message
    const msg = `
👀 <b>New Visitor Online!</b>
${flag(info.country)} <b>${info.city || "Unknown"}, ${info.region || "Unknown"}, ${info.country || "Unknown"}</b>
🏢 <b>ISP:</b> ${info.org || "Unknown"}
🌐 <b>IP:</b> <code>${ip}</code>
🔗 <b>Source:</b> ${req.headers["referer"] || "Direct"}
🕒 <b>Time:</b> ${new Date().toLocaleString()}
`;
    await notifyTelegram(msg);

    res.status(200).json({ ok: true });

  } catch (err) {
    console.error("TRACK ERROR:", err);
    res.status(500).json({ error: "track_failed" });
  }
}
