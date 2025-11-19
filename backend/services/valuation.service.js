import yahooFinance from "../config/yahooFinanceClient.js";
import { computePeriodRange, prefixForType, makeFieldGetter, toISO, ymd } from "../helpers/finHelpers.js";

// (kept from earlier)
async function _incomeRows(symbol, { type, period1, period2 }) {
  const PFX = prefixForType(type);
  const raw = await yahooFinance.fundamentalsTimeSeries(
    symbol,
    { type, module: "financials", period1, period2 },
    { validateResult: false }
  );
  return (raw || [])
    .filter(r => r && (r.TYPE === "FINANCIALS" || r.periodType))
    .map(r => {
      const getF = makeFieldGetter(r, PFX);
      const epsDiluted    = getF("DilutedEPS","BasicEPS");
      const sharesDiluted = getF("DilutedAverageShares","AverageDilutionEarnings","BasicAverageShares");
      return {
        endDate: toISO(r.date),
        epsDiluted: Number.isFinite(epsDiluted) ? epsDiluted : null,
        sharesDiluted: Number.isFinite(sharesDiluted) ? sharesDiluted : null
      };
    })
    .filter(x => x.endDate)
    .sort((a,b) => (a.endDate < b.endDate ? -1 : 1));
}

async function _balanceRows(symbol, { type, period1, period2 }) {
  const PFX = prefixForType(type);
  const raw = await yahooFinance.fundamentalsTimeSeries(
    symbol,
    { type, module: "balance-sheet", period1, period2 },
    { validateResult: false }
  );
  return (raw || [])
    .filter(r => r && r.date)
    .map(r => {
      const getF = makeFieldGetter(r, PFX);
      const equity       = getF("StockholdersEquity","CommonStockEquity","TotalShareholdersEquity");
      const sharesIssued = getF("OrdinarySharesNumber","ShareIssued","CommonSharesOutstanding");
      return {
        endDate: toISO(r.date),
        equity: Number.isFinite(equity) ? equity : null,
        sharesIssued: Number.isFinite(sharesIssued) ? sharesIssued : null
      };
    })
    .filter(x => x.endDate)
    .sort((a,b) => (a.endDate < b.endDate ? -1 : 1));
}

async function _priceMap(symbol, { period1, period2 }) {
  const start = new Date(period1); start.setDate(start.getDate() - 10);
  const end   = new Date(period2); end.setDate(end.getDate() + 2);
  const chart = await yahooFinance.chart(symbol, { interval: "1d", period1: start, period2: end });
  const map = new Map();
  for (const q of chart?.quotes || []) {
    const key = ymd(new Date(q.date));
    map.set(key, q.close);
  }
  return map;
}

function _findCloseOnOrBefore(dateISO, priceMap) {
  const d = new Date(dateISO);
  for (let i = 0; i < 10; i++) {
    const key = ymd(d);
    if (priceMap.has(key)) return priceMap.get(key);
    d.setDate(d.getDate() - 1);
  }
  return null;
}

// NEW: compute EPS_TTM from last 4 quarterly EPS
async function _epsTTMFromQuarterly(symbol) {
  const end = new Date(); const start = new Date(end); start.setFullYear(end.getFullYear() - 2);
  const raw = await yahooFinance.fundamentalsTimeSeries(
    symbol,
    { type: "quarterly", module: "financials", period1: ymd(start), period2: ymd(end) },
    { validateResult: false }
  );
  const rows = (raw || [])
    .filter(r => r && (r.TYPE === "FINANCIALS" || r.periodType))
    .sort((a,b) => (new Date(a.date) - new Date(b.date)));
  const getF = (r) => makeFieldGetter(r, "quarterly")("DilutedEPS","BasicEPS");
  const last4 = rows.slice(-4).map(r => getF(r));
  if (last4.length === 4 && last4.every(Number.isFinite)) {
    return last4.reduce((a,b)=>a+b,0);
  }
  return null;
}

// NEW: compute latest BVPS from quarterly balance sheet (equity/shares)
async function _bvpsFromQuarterly(symbol) {
  const end = new Date(); const start = new Date(end); start.setFullYear(end.getFullYear() - 2);
  const raw = await yahooFinance.fundamentalsTimeSeries(
    symbol,
    { type: "quarterly", module: "balance-sheet", period1: ymd(start), period2: ymd(end) },
    { validateResult: false }
  );
  const rows = (raw || [])
    .filter(r => r && r.date)
    .sort((a,b) => (new Date(a.date) - new Date(b.date)));
  const latest = rows.at(-1);
  if (!latest) return null;
  const getF = makeFieldGetter(latest, "quarterly");
  const equity = getF("StockholdersEquity","CommonStockEquity","TotalShareholdersEquity");
  const shares = getF("OrdinarySharesNumber","ShareIssued","CommonSharesOutstanding");
  if (Number.isFinite(equity) && Number.isFinite(shares) && shares !== 0) {
    return equity / shares;
  }
  return null;
}

/**
 * Build P/E & P/B history and append a "current" snapshot
 *  - type: 'annual' | 'quarterly'
 *  - ttm: if true and type=quarterly, EPS uses last 4 quarters
 *  - includeCurrent: if true (default), append today's PE/PB using latest price + TTM/BVPS
 */
export async function getPePbHistory(
  symbol,
  { type = "annual", from, to, limit = 8, ttm = false, includeCurrent = true } = {}
) {
  const { period1, period2 } = computePeriodRange(type, from, to);

  const [inc, bal] = await Promise.all([
    _incomeRows(symbol, { type, period1, period2 }),
    _balanceRows(symbol, { type, period1, period2 })
  ]);

  const balByDate = new Map(bal.map(r => [r.endDate, r]));
  const merged = inc.map(row => ({ endDate: row.endDate, ...row, ...(balByDate.get(row.endDate) || {}) }));

  const priceMap = await _priceMap(symbol, { period1, period2 });

  let series = merged.map((row, idx, arr) => {
    const price = _findCloseOnOrBefore(row.endDate, priceMap);
    let eps = row.epsDiluted;
    if (ttm && type === "quarterly") {
      let sum = 0, n = 0;
      for (let k = idx; k >= 0 && n < 4; k--, n++) {
        const v = arr[k].epsDiluted;
        if (Number.isFinite(v)) sum += v; else { sum = null; break; }
      }
      eps = (sum !== null && n === 4) ? sum : null;
    }
    const shares = Number.isFinite(row.sharesIssued) ? row.sharesIssued : row.sharesDiluted;
    const bvps = (Number.isFinite(row.equity) && Number.isFinite(shares) && shares !== 0) ? row.equity / shares : null;

    const pe = (Number.isFinite(price) && Number.isFinite(eps) && eps > 0) ? (price / eps) : null;
    const pb = (Number.isFinite(price) && Number.isFinite(bvps) && bvps > 0) ? (price / bvps) : null;

    return { endDate: row.endDate, priceClose: Number.isFinite(price) ? price : null, eps, pe, bvps, pb };
  });

  // --- Append CURRENT snapshot (today) ---
  if (includeCurrent) {
    // latest market price
    const qt = await yahooFinance.quote(symbol).catch(() => null);
    const latestPrice = Number.isFinite(qt?.regularMarketPrice) ? qt.regularMarketPrice : null;

    // fundamentals-based estimates
    const [epsTTM, bvpsLatest] = await Promise.all([
      _epsTTMFromQuarterly(symbol),
      _bvpsFromQuarterly(symbol)
    ]);

    // quoteSummary fallback ratios if available
    let peNow = null, pbNow = null;
    try {
      const qs = await yahooFinance.quoteSummary(symbol, { modules: ["defaultKeyStatistics", "summaryDetail"] });
      const ks = qs?.defaultKeyStatistics || {};
      const sd = qs?.summaryDetail || {};
      const peCand = ks.trailingPE ?? sd.trailingPE;
      const pbCand = ks.priceToBook ?? sd.priceToBook;
      if (Number.isFinite(peCand)) peNow = peCand;
      if (Number.isFinite(pbCand)) pbNow = pbCand;
    } catch {}

    // derive missing values from price + fundamentals
    if (!Number.isFinite(peNow) && Number.isFinite(latestPrice) && Number.isFinite(epsTTM) && epsTTM > 0) {
      peNow = latestPrice / epsTTM;
    }
    if (!Number.isFinite(pbNow) && Number.isFinite(latestPrice) && Number.isFinite(bvpsLatest) && bvpsLatest > 0) {
      pbNow = latestPrice / bvpsLatest;
    }

    const current = {
      endDate: new Date().toISOString(),
      priceClose: Number.isFinite(latestPrice) ? latestPrice : null,
      eps: Number.isFinite(epsTTM) ? epsTTM : null,
      pe: Number.isFinite(peNow) ? peNow : null,
      bvps: Number.isFinite(bvpsLatest) ? bvpsLatest : null,
      pb: Number.isFinite(pbNow) ? pbNow : null
    };

    series.push(current);
  }

  // sort desc and limit
  series = series.sort((a,b) => (a.endDate < b.endDate ? 1 : -1)).slice(0, Number(limit) || 8);

  return { symbol, type, ttm: Boolean(ttm), period1, period2, count: series.length, series };
}
