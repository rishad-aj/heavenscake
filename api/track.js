// track.js
import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const TELEGRAM_API = TELEGRAM_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage` : null;

// small helper to turn country code to emoji (works for A-Z codes)
const getFlagEmoji = (countryCode) =>
  countryCode ? String.fromCodePoint(...[...countryCode.toUpperCase()].map(c => 127397 + c.charCodeAt())) : '🏳️';

// Normalise IP from x-forwarded-for and remove IPv6 prefix if present (::ffff:1.2.3.4)
function extractClientIp(req) {
  const raw = (req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress || '').toString();
  const ip = raw.split(',')[0].trim();
  // strip IPv6 prefix for IPv4-mapped addresses
  return ip.replace(/^::ffff:/, '');
}

// Reuse extractLogsFromJson from stats (simple version here)
function extractLogsFromJson(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.record?.visitors)) return json.record.visitors;
  if (Array.isArray(json.record)) return json.record;
  if (Array.isArray(json.visitors)) return json.visitors;
  if (Array.isArray(json.logs)) return json.logs;
  if (Array.isArray(json.data)) return json.data;
  for (const k of Object.keys(json)) {
    if (Array.isArray(json[k])) return json[k];
  }
  return [];
}

export default async function handler(req, res) {
  try {
    // Accept GET/POST for compatibility
    const method = req.method;
    if (method !== 'GET' && method !== 'POST') return res.status(405).send('Method Not Allowed');

    const ip = extractClientIp(req);
    const ipInfoToken = process.env.IPINFO_TOKEN || null; // allow overriding token via env
    const ipInfoUrl = ipInfoToken ? `https://ipinfo.io/${ip}/json?token=${ipInfoToken}` : `https://ipinfo.io/${ip}/json`;

    // get basic location info (best-effort)
    let locationData = { city: 'Unknown', country: 'Unknown', org: 'Unknown' };
    try {
      const r = await fetch(ipInfoUrl);
      if (r.ok) {
        const json = await r.json();
        locationData.city = json.city || 'Unknown';
        locationData.country = json.country || 'Unknown';
        locationData.org = json.org || json.hostname || 'Unknown';
      }
    } catch (err) {
      console.warn('ipinfo failed:', err);
    }

    const timestamp = new Date().toISOString();
    const source = req.headers.referer || req.headers.origin || req.headers['user-agent'] || 'Direct / Unknown';

    const visitor = {
      ip,
      city: locationData.city,
      country: locationData.country,
      isp: locationData.org,
      source,
      timestamp
    };

    // Read existing logs from JSONBin (tolerant)
    let logs = [];
    if (!JSONBIN_API_KEY || !BIN_ID) {
      return res.status(500).json({ ok: false, error: 'Missing JSONBIN_API_KEY or JSONBIN_BIN_ID environment variable' });
    }

    try {
      const r = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });

      if (r.ok) {
        const json = await r.json();
        logs = extractLogsFromJson(json) || [];
      } else {
        // non-200, but keep going with empty logs
        logs = [];
      }
    } catch (err) {
      console.warn('Error reading JSONBin (continuing with empty logs):', err);
      logs = [];
    }

    // Ensure logs is an array
    if (!Array.isArray(logs)) logs = [];

    // Append new visitor and cap to a reasonable number (to avoid huge bin sizes)
    logs.push(visitor);
    const MAX_LOGS = parseInt(process.env.MAX_LOGS || '2000', 10);
    if (logs.length > MAX_LOGS) logs = logs.slice(logs.length - MAX_LOGS);

    // Save updated logs back to JSONBin (v3)
    try {
      // We'll save shape { visitors: [...] } which our stats reads tolerate
      const payload = { visitors: logs };
      await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_API_KEY,
          'X-Bin-Versioning': 'false'
        },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error('Failed to save to JSONBin:', err);
      // proceed — visitor still recorded in memory
    }

    // Send Telegram notification if configured
    if (TELEGRAM_TOKEN && CHAT_ID && TELEGRAM_API) {
      try {
        const flag = getFlagEmoji(visitor.country);
        const message = `👀 *New Visitor Online!*
${flag} ${visitor.city}, ${visitor.country}
🏢 ISP: ${visitor.isp}
🌐 IP: \`${visitor.ip}\`
🔗 Source: ${visitor.source}
🕒 Time: ${visitor.timestamp}`;

        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: [[{ text: "📊 Show Stats", callback_data: "/start" }]] }
          })
        });
      } catch (err) {
        console.warn('Telegram notify failed:', err);
      }
    }

    return res.status(200).json({ ok: true, visitor });
  } catch (err) {
    console.error('Unhandled error in track handler:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
