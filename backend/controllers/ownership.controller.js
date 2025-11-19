import { getShareholdingPattern } from "../services/ownership.services.js";

export async function shareholding(req, res) {
  const { symbol } = req.params;
  const data = await getShareholdingPattern(symbol);
  res.set("Cache-Control", "public, max-age=600, stale-while-revalidate=3600");
  res.json(data);
}
