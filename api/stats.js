// /api/stats.js
import fetch from "node-fetch";

const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY;
const BIN_ID = process.env.JSONBIN_BIN_ID;

export async function getStats() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    headers: { "X-Master-Key": JSONBIN_API_KEY }
  });
  const data = await res.json();
  return data.record;
}

export async function updateStats(stats) {
  await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Master-Key": JSONBIN_API_KEY
    },
    body: JSON.stringify(stats)
  });
}
