import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

function toDateFromTimestampField(ts) {
  if (!ts && ts !== 0) return null;
  if (typeof ts === 'number') {
    if (ts < 1e12) return new Date(ts * 1000);
    return new Date(ts);
  }
  if (typeof ts === 'string' && /^\d+$/.test(ts)) {
    const n = Number(ts);
    if (n < 1e12) return new Date(n * 1000);
    return new Date(n);
  }
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d;
  return null;
}

function findLogsArray(record) {
  if (!record) return [];
  if (Array.isArray(record)) return record;
  if (Array.isArray(record.visitors)) return record.visitors;
  if (Array.isArray(record.logs)) return record.logs;
  if (Array.isArray(record.data)) return record.data;
  for (const key of Object.keys(record)) {
    if (Array.isArray(record[key])) return record[key];
  }
  return [];
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET')
      return res.status(405).send('Method Not Allowed');

    const debug = req.query?.debug === '1' || req.query?.debug === 'true';

    let logs = [];
    let rawJson = null;
    try {
      if (!JSONBIN_API_KEY || !BIN_ID) {
        throw new Error('Missing JSONBIN_API_KEY or JSONBIN_BIN_ID environment variable');
      }

      const resBin = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });

      const text = await resBin.text();
      if (!resBin.ok) {
        throw new Error(`JSONBin fetch failed: ${resBin.status} ${resBin.statusText} - ${text}`);
      }

      try {
        rawJson = JSON.parse(text);
      } catch (parseErr) {
        throw new Error(`Failed to parse JSON from JSONBin: ${parseErr.message}`);
      }

      const record = rawJson?.record ?? rawJson;
      logs = findLogsArray(record);
    } catch (err) {
      console.error('Error fetching/parsing JSONBin:', err);
      if (debug) {
        return res.status(200).json({
          ok: false,
          error: String(err),
          rawJson,
          logsPreview: [],
        });
      }
      logs = [];
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - now.getUTCDay()));

    const stats = {
      total: logs.length,
      day: 0,
      week: 0,
      month: 0,
      year: 0
    };

    for (const v of logs) {
      const rawTs = v.timestamp ?? v.time ?? v.t ?? v.date ?? v.ts ?? v.created_at ?? null;
      const d = toDateFromTimestampField(rawTs);
      if (!d) continue;

      const iso = d.toISOString();
      if (iso.startsWith(today)) stats.day += 1;
      if (d >= weekStart) stats.week += 1;
      if (d.getUTCMonth() === now.getUTCMonth() && d.getUTCFullYear() === now.getUTCFullYear()) stats.month += 1;
      if (d.getUTCFullYear() === now.getUTCFullYear()) stats.year += 1;
    }

    const message = `📊 *Visitor Stats*
───────────────
🧮 Total: ${stats.total}
📆 Today: ${stats.day}
📅 This Week: ${stats.week}
🗓️ This Month: ${stats.month}
📈 This Year: ${stats.year}`;

    if (TELEGRAM_TOKEN && CHAT_ID) {
      try {
        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
          })
        });
      } catch (err) {
        console.error('Failed to send Telegram message:', err);
      }
    } else {
      if (debug) console.warn('TELEGRAM_TOKEN or CHAT_ID not configured; skipping Telegram send');
    }

    const response = { ok: true, stats };
    if (debug) {
      response.debug = {
        rawJson,
        logsCount: logs.length,
        sampleLogs: logs.slice(0, 10)
      };
    }

    res.status(200).json(response);
  } catch (err) {
    console.error('Error in stats.js:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
