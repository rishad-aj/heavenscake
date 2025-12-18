// /api/stats.js
import fetch from "node-fetch";

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;

const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

/* ---------------- GET STATS ---------------- */
export async function getStats() {
  const res = await fetch(BIN_URL, {
    headers: {
      "X-Master-Key": JSONBIN_API_KEY
    }
  });

  if (!res.ok) throw new Error("Failed to fetch stats");

  const data = await res.json();

  // Always return a safe structure
  return {
    total: data.record.total ?? 0,
    days: data.record.days ?? {},
    months: data.record.months ?? {},
    years: data.record.years ?? {}
  };
}

/* ---------------- UPDATE STATS ---------------- */
export async function updateStats(stats) {
  const res = await fetch(BIN_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_API_KEY
    },
    body: JSON.stringify(stats)
  });

  if (!res.ok) throw new Error("Failed to update stats");
}
