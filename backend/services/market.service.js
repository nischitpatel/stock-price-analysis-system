import yahooFinance from "../config/yahooFinanceClient.js";

/**
 * Get trending symbols from Yahoo Finance.
 * Defaults: region 'US', top 5.
 */
export async function getTrendingSymbols({ region = "US", count = 5, lang } = {}) {
  // Per v3 docs: trendingSymbols(region, { count, lang })
  // https://jsr.io/@gadicc/yahoo-finance2/doc/modules/trendingSymbols
  const opts = {};
  if (lang) opts.lang = lang;
  if (count) opts.count = Number(count);

  const res = await yahooFinance.trendingSymbols(region, opts);

  console.log(`Fetched ${Array.isArray(res?.quotes) ? res.quotes.length : 0} trending symbols for region=${region} lang=${lang} count=${count}`);

  // Defensive normalize
  const quotes = Array.isArray(res?.quotes) ? res.quotes : [];
  const top = quotes
    .filter(q => q && q.symbol)   // drop any weird/null entries
    .slice(0, 5);                 // enforce top 5 no matter what

  return {
    region,
    requestedCount: Number(count) || 5,
    availableCount: top.length,
    symbols: top.map(q => q.symbol),
    quotes: top,                  // keep raw quote stubs in case you want names later
    jobTimestamp: res?.jobTimestamp ?? null,
  };
}
