// stats.js
import fetch from 'node-fetch';

const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;
const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;
const TELEGRAM_API = TELEGRAM_TOKEN ? `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage` : null;

// Convert many timestamp formats (seconds, ms, ISO string) into a Date or null
function toDateFromTimestampField(ts) {
  if (ts === null || ts === undefined) return null;

  // number-like string
  if (typeof ts === 'string' && /^\d+$/.test(ts)) {
    const n = Number(ts);
    if (n < 1e12) return new Date(n * 1000);
    return new Date(n);
  }

  if (typeof ts === 'number') {
    // if it's small treat as seconds
    if (ts < 1e12) return new Date(ts * 1000);
    return new Date(ts);
  }

  // If object with `.timestamp` or `.time` etc (rare) try to extract
  if (typeof ts === 'object') {
    const candidate = ts.timestamp ?? ts.time ?? ts.t ?? ts.date ?? ts.ts ?? null;
    if (candidate) return toDateFromTimestampField(candidate);
    return null;
  }

  // otherwise try Date parser
  const d = new Date(ts);
  if (!isNaN(d.getTime())) return d;
  return null;
}

// Find an array of log objects inside many possible shapes: visitors, logs, data, record, etc.
function extractLogsFromJson(json) {
  if (!json) return [];

  // If already an array of objects, return it (but ensure elements are objects)
  if (Array.isArray(json) && json.length > 0 && typeof json[0] === 'object') return json;

  // Common fields
  const candidates = [
    json.visitors,
    json.logs,
    json.data,
    json.entries,
    json.records,
    json.record, // sometimes record is directly an array or object containing array
    json.body
  ];

  for (const c of candidates) {
    if (Array.isArray(c)) return c;
    // sometimes record is an object with visitors inside
    if (c && typeof c === 'object') {
      const sub = extractLogsFromJson(c);
      if (Array.isArray(sub) && sub.length) return sub;
    }
  }

  // If json.record exists and is an object, try deeper search
  if (json.record && typeof json.record === 'object') {
    for (const key of Object.keys(json.record)) {
      if (Array.isArray(json.record[key])) return json.record[key];
      if (typeof json.record[key] === 'object') {
        const sub = extractLogsFromJson(json.record[key]);
        if (Array.isArray(sub) && sub.length) return sub;
      }
    }
  }

  // As a last resort search keys for any arrays of objects
  for (const key of Object.keys(json)) {
    if (Array.isArray(json[key]) && json[key].length > 0 && typeof json[key][0] === 'object') return json[key];
  }

  return [];
}

function startOfWeekUTC(date = new Date()) {
  // Sunday as start of week (consistent with getUTCDay())
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() - day);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }

    const debug = req.query?.debug === '1' || req.query?.debug === 'true';

    if (!JSONBIN_API_KEY || !BIN_ID) {
      return res.status(500).json({ ok: false, error: 'Missing JSONBIN_API_KEY or JSONBIN_BIN_ID environment variable' });
    }

    let rawJson = null;
    let logs = [];

    try {
      const r = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_API_KEY }
      });

      const text = await r.text();
      if (!r.ok) {
        throw new Error(`JSONBin fetch failed: ${r.status} ${r.statusText} - ${text}`);
      }

      try {
        rawJson = JSON.parse(text);
      } catch (err) {
        // try json() as fallback
        try {
          rawJson = await r.json();
        } catch (err2) {
          throw new Error('Failed to parse JSONBin response body');
        }
      }

      logs = extractLogsFromJson(rawJson);
      if (!Array.isArray(logs)) logs = [];
    } catch (err) {
      console.error('Error reading JSONBin:', err);
      if (debug) {
        return res.status(200).json({
          ok: false,
          error: String(err),
          rawJson: rawJson ?? null,
        });
      } else {
        logs = [];
      }
    }

    // If logs isn't an array yet, coerce empty
    logs = Array.isArray(logs) ? logs : [];

    const now = new Date();
    const todayISO = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())).toISOString().slice(0, 10);
    const weekStart = startOfWeekUTC(now);

    const stats = { total: logs.length, day: 0, week: 0, month: 0, year: 0 };

    for (const v of logs) {
      // Accept various timestamp field names
      const rawTs = (v && (v.timestamp ?? v.time ?? v.t ?? v.date ?? v.ts ?? v.created_at ?? v.createdAt ?? v.added)) ?? null;
      const d = toDateFromTimestampField(rawTs);
      if (!d) continue;

      // Use UTC ISO date for day match
      const isoDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
      if (isoDate === todayISO) stats.day += 1;
      if (d >= weekStart) stats.week += 1;
      if (d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth()) stats.month += 1;
      if (d.getUTCFullYear() === now.getUTCFullYear()) stats.year += 1;
    }

    const message = `📊 *Visitor Stats*
───────────────
🧮 Total: ${stats.total}
📆 Today: ${stats.day}
📅 This Week: ${stats.week}
🗓️ This Month: ${stats.month}
📈 This Year: ${stats.year}`;

    // Send Telegram only if configured
    if (TELEGRAM_TOKEN && CHAT_ID && TELEGRAM_API) {
      try {
        await fetch(TELEGRAM_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: 'Markdown' })
        });
      } catch (err) {
        console.error('Telegram send failed:', err);
      }
    } else {
      if (debug) console.warn('TELEGRAM_TOKEN or CHAT_ID not set — skipping Telegram send');
    }

    const response = { ok: true, stats };

    if (debug) {
      response.debug = {
        rawJson,
        logsPreview: logs.slice(0, 10),
        logsCount: logs.length
      };
    }

    return res.status(200).json(response);
  } catch (err) {
    console.error('Unhandled error in stats handler:', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
