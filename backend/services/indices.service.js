import yahooFinance from "../config/yahooFinanceClient.js";

// Pick the 5 big ones: S&P 500, Dow, Nasdaq Comp, Russell 2000, Nasdaq 100
const US_INDEX_SYMBOLS = ["^GSPC", "^DJI", "^IXIC", "^RUT", "^NDX"];

/** pick the right fields based on market state, with fallbacks */
function normalizeIndexQuote(q) {
  // prefer state-specific fields when available
  const state = q?.marketState || "REGULAR";

  // Base refs
  const prevClose = q?.regularMarketPreviousClose ?? null;

  // choose price/change/percent by session with graceful fallback
  let price = q?.regularMarketPrice ?? null;
  let change = q?.regularMarketChange ?? null;
  let changePercent = q?.regularMarketChangePercent ?? null;

  if (state === "PRE") {
    price = q?.preMarketPrice ?? price;
    change = q?.preMarketChange ?? change;
    changePercent = q?.preMarketChangePercent ?? changePercent;
  } else if (state === "POST") {
    price = q?.postMarketPrice ?? price;
    change = q?.postMarketChange ?? change;
    changePercent = q?.postMarketChangePercent ?? changePercent;
  }

  // Compute missing pieces if needed
  if ((change == null || !Number.isFinite(change)) && Number.isFinite(price) && Number.isFinite(prevClose)) {
    change = price - prevClose;
  }
  if ((changePercent == null || !Number.isFinite(changePercent)) && Number.isFinite(change) && Number.isFinite(prevClose) && prevClose !== 0) {
    changePercent = (change / prevClose) * 100;
  }

  // Timestamp
  const ts =
    q?.regularMarketTime ??
    q?.postMarketTime ??
    q?.preMarketTime ??
    null;
  const asOf = ts ? new Date(ts * 1000).toISOString() : null;

  return {
    symbol: q?.symbol,
    name: q?.shortName || q?.longName || q?.indexName || q?.symbol,
    marketState: state,
    current: Number.isFinite(price) ? price : null,
    change: Number.isFinite(change) ? change : null,
    percent: Number.isFinite(changePercent) ? changePercent : null,
    previousClose: Number.isFinite(prevClose) ? prevClose : null,
    asOf
  };
}

export async function getUsTop5Indices() {
  // yahoo-finance2 supports array input for quote()
  const quotes = await yahooFinance.quote(US_INDEX_SYMBOLS);
  console.log("Fetched US indices:", quotes);
  const items = (Array.isArray(quotes) ? quotes : [quotes]).map(normalizeIndexQuote);

  return {
    region: "US",
    indices: items
  };
}
