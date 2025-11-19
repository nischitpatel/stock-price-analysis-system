import { getTrendingSymbols } from "../services/market.service.js";

export async function trendingSymbols(req, res) {
  const region = (req.query.region || "US").toUpperCase(); // e.g. US, GB, JP, DE
  const count  = Number(req.query.count || 5);
  const lang   = req.query.lang;                            // e.g. en-US, de-DE

  const data = await getTrendingSymbols({ region, count, lang });

  res.set("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
  res.json(data);
}
