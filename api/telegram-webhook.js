// /api/telegram-webhook.js
import fetch from "node-fetch";
import { detailStore } from "./track"; // only works if both files run in same node process

const { TELEGRAM_BOT_TOKEN } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

// Helper to answer callback queries
const answerCallback = (callback_query_id, text, show_alert = true) =>
  fetch(`${TELEGRAM_API}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      callback_query_id,
      text,
      show_alert
    })
  });

export default async function handler(req, res) {
  try {
    const body = req.body;

    // only handle callback_query updates
    if (!body || !body.callback_query) {
      return res.status(200).json({ ok: true, info: "not a callback_query" });
    }

    const { callback_query } = body;
    const { data, id: callbackId } = callback_query;

    if (!data || !data.startsWith("VIEW_DETAILS:")) {
      // unknown action
      await answerCallback(callbackId, "Unknown action.", false);
      return res.status(200).json({ ok: true });
    }

    const id = data.split(":")[1];
    const details = detailStore.get(id);

    if (!details) {
      // expired or not found
      await answerCallback(callbackId, "Details expired or unavailable.", true);
      return res.status(200).json({ ok: true });
    }

    // Show the full details in an alert inside Telegram
    await answerCallback(callbackId, details, true);

    // optionally delete stored details after revealing
    detailStore.delete(id);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("WEBHOOK ERROR:", err);
    return res.status(500).json({ error: "webhook_failed" });
  }
}
