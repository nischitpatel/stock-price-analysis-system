import { getPePbHistory } from "../services/valuation.service.js";

export async function pePbHistory(req, res) {
  const { symbol } = req.params;
  const type  = (req.query.type || req.query.period || "annual").toLowerCase();
  const limit = Number(req.query.limit || 8);
  const ttm   = req.query.ttm === "1" || req.query.ttm === "true";

  if (!["annual","quarterly","trailing"].includes(type)) {
    return res.status(400).json({ error: "Invalid type: use 'annual' or 'quarterly' (trailing allowed but treated like quarterly)." });
  }

  const data = await getPePbHistory(symbol, {
    type,
    from: req.query.from || req.query.period1,
    to:   req.query.to   || req.query.period2,
    limit,
    ttm
  });

  res.set("Cache-Control", "public, max-age=1800, stale-while-revalidate=86400");
  res.json(data);
}
