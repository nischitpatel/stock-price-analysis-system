import {
  getBalanceSheetRaw,
  getIncomeStatementRaw,
  getBalanceSheetNormalized,
  getIncomeStatementNormalized,
} from "../services/fundamentals.services.js";

export async function balanceSheetRaw(req, res) {
  const { symbol } = req.params;
  const type = (req.query.type || req.query.period || "annual").toLowerCase();
  if (!["annual", "quarterly", "trailing"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }
  const { request, data } = await getBalanceSheetRaw(symbol, {
    type,
    from: req.query.from || req.query.period1,
    to: req.query.to || req.query.period2,
  });
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json({ symbol, ...request, count: Array.isArray(data) ? data.length : 0, data });
}

export async function incomeStatementRaw(req, res) {
  const { symbol } = req.params;
  const type = (req.query.type || req.query.period || "annual").toLowerCase();
  if (!["annual", "quarterly", "trailing"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }
  const { request, data } = await getIncomeStatementRaw(symbol, {
    type,
    from: req.query.from || req.query.period1,
    to: req.query.to || req.query.period2,
  });
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json({ symbol, ...request, count: Array.isArray(data) ? data.length : 0, data });
}

export async function balanceSheetNormalized(req, res) {
  const { symbol } = req.params;
  const type  = (req.query.type || req.query.period || "annual").toLowerCase();
  const limit = Number(req.query.limit || 6);
  const debug = req.query.debug === "1";

  if (!["annual","quarterly","trailing"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }

  const { statements, period1, period2 } = await getBalanceSheetNormalized(
    symbol,
    {
      type,
      from: req.query.from || req.query.period1,
      to:   req.query.to   || req.query.period2,
      limit,
      debug
    }
  );

  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json({ symbol, type, period1, period2, count: statements.length, statements });
}

export async function incomeStatementNormalized(req, res) {
  const { symbol } = req.params;
  const type = (req.query.type || req.query.period || "annual").toLowerCase();
  const limit = Number(req.query.limit || 6);
  if (!["annual", "quarterly", "trailing"].includes(type)) {
    return res.status(400).json({ error: "Invalid type" });
  }
  const { request, statements, period1, period2 } = await getIncomeStatementNormalized(symbol, {
    type,
    from: req.query.from || req.query.period1,
    to: req.query.to || req.query.period2,
    limit
  });
  res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");
  res.json({ symbol, type, period1, period2, count: statements.length, statements });
}
