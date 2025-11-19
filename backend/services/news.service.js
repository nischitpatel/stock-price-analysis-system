import finnhub from "../config/finnhubClient.js";

const toISO = (secOrMs) => {
  if (secOrMs == null) return null;
  const ms = secOrMs < 1e12 ? secOrMs * 1000 : secOrMs; // Finnhub uses seconds
  return new Date(ms).toISOString();
};

const mapArticle = (a) => ({
  id: a.id ?? null,
  headline: a.headline ?? a.title ?? "",
  source: a.source ?? "",
  url: a.url ?? "",
  datetime: toISO(a.datetime),
  related: a.related ?? "",
  category: a.category ?? "",
});

// category: general|forex|crypto|merger
export async function getMarketNews({ category = "general", minId, limit = 20 } = {}) {
  const cat = String(category).toLowerCase();
  if (!["general", "forex", "crypto", "merger"].includes(cat)) {
    throw new Error("Invalid category. Use general|forex|crypto|merger");
  }

  const { data } = await finnhub.get("/news", { params: { category: cat, minId } });
  const items = (Array.isArray(data) ? data : []).map(mapArticle);

  return {
    category: cat,
    count: Math.min(Number(limit) || 20, items.length),
    minId: minId ?? null,
    items: items.slice(0, Number(limit) || 20),
  };
}

/**
 * Latest company news
 * - days: look-back window (default 14)
 * - limit: max articles to return (default 20)
 */
export async function getCompanyLatestNews(symbol, { days = 14, limit = 20 } = {}) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - Number(days || 14));

  const isoDate = (d) => d.toISOString().slice(0, 10);

  const { data } = await finnhub.get("/company-news", {
    params: { symbol, from: isoDate(start), to: isoDate(end) },
  });

  const items = (Array.isArray(data) ? data : [])
    .map(mapArticle)
    .sort((a, b) => (a.datetime < b.datetime ? 1 : -1)) // newest first
    .slice(0, Number(limit) || 20);

  return {
    symbol,
    from: isoDate(start),
    to: isoDate(end),
    count: items.length,
    items,
  };
}
