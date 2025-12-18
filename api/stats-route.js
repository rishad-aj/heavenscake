// /api/stats-route.js
import { getStats } from "./stats";

export default async function handler(req, res) {
  try {
    const stats = await getStats();
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: "failed_to_get_stats" });
  }
}
