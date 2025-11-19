import yahooFinance from "../config/yahooFinanceClient.js";

/** Try to infer issuer country from symbol suffix if summaryProfile.country missing */
function inferCountryFromSymbol(symbol) {
  const s = symbol.toUpperCase();
  if (/\.(NS|BO)$/.test(s)) return "India";           // NSE/BSE
  if (/\.L$/.test(s)) return "United Kingdom";
  if (/\.HK$/.test(s)) return "Hong Kong";
  if (/\.T$/.test(s)) return "Japan";
  if (/\.(TO|V)$/.test(s)) return "Canada";
  if (/\.AX$/.test(s)) return "Australia";
  if (/\.SS$/.test(s)) return "China";
  if (/\.TW$/.test(s)) return "Taiwan";
  return "United States";
}

function toPct(x) {
  // Yahoo often returns decimals (0.1234 = 12.34%). Accept % too; normalize to 0..100
  if (!Number.isFinite(x)) return null;
  return x <= 1 ? x * 100 : x;
}

function clamp01pct(x) {
  if (!Number.isFinite(x)) return null;
  if (x < 0) return 0;
  if (x > 100) return 100;
  return x;
}

/** Sum a list of holders by percentage field (pctHeld or percentHeld), optionally filtering by country */
function sumPct(list, pred = () => true) {
  if (!Array.isArray(list)) return 0;
  let total = 0;
  for (const h of list) {
    if (!pred(h)) continue;
    const p = h?.pctHeld ?? h?.percentHeld ?? h?.percentageHeld;
    const add = toPct(p);
    if (Number.isFinite(add)) total += add;
  }
  return total;
}

/**
 * Build shareholding pattern: promoters (insiders), DII, FII, public, others
 * - promoters: majorHoldersBreakdown.heldByInsiders (%)
 * - institutions: majorHoldersBreakdown.heldByInstitutions (%)
 * - DII/FII split (best-effort): aggregate institutionOwnership + fundOwnership by holder.country
 * - public: 100 - (promoters + (DII+FII or institutions))
 * - others: remainder due to rounding/unclassified (>=0)
 */
export async function getShareholdingPattern(symbol) {
  const modules = [
    "majorHoldersBreakdown",
    "institutionOwnership",
    "fundOwnership",
    "summaryProfile",
  ];

  const qs = await yahooFinance.quoteSummary(symbol, { modules }).catch(() => ({}));

  console.log(qs);

  const country =
    qs?.summaryProfile?.country ||
    inferCountryFromSymbol(symbol);

  const mh = qs?.majorHoldersBreakdown || {};
  // Normalize to %
  const promotersPct = toPct(mh.heldByInsiders ?? mh.insidersPercentHeld);
  const instPctTotal = toPct(mh.heldByInstitutions ?? mh.institutionsPercentHeld);

  // Aggregate DII / FII if holder country is available
  const instList = qs?.institutionOwnership?.ownershipList || qs?.institutionOwnership?.holders || [];
  const fundList = qs?.fundOwnership?.ownershipList || qs?.fundOwnership?.holders || [];
  const allInst  = [...(instList || []), ...(fundList || [])];

  // Some payloads include `country` or `location` (varies by market). Try both.
  const diiPct = sumPct(allInst, (h) => (h?.country || h?.location) === country);
  const fiiPct = sumPct(allInst, (h) => (h?.country || h?.location) && (h?.country || h?.location) !== country);

  // If we couldn’t split, fall back to totals
  const hasSplit = diiPct > 0 || fiiPct > 0;
  const institutionsPct = hasSplit ? diiPct + fiiPct : (Number.isFinite(instPctTotal) ? instPctTotal : null);

  // Public = 100 - promoters - institutions (if known)
  let publicPct = null;
  if (Number.isFinite(promotersPct) && Number.isFinite(institutionsPct)) {
    publicPct = 100 - promotersPct - institutionsPct;
  } else if (Number.isFinite(promotersPct) && !Number.isFinite(institutionsPct)) {
    // If institutions missing entirely, we can’t confidently compute public
    publicPct = null;
  } else if (!Number.isFinite(promotersPct) && Number.isFinite(institutionsPct)) {
    publicPct = null;
  }

  // Others: non-negative remainder after clamping
  let promoters = clamp01pct(promotersPct);
  let dii       = hasSplit ? clamp01pct(diiPct) : null;
  let fii       = hasSplit ? clamp01pct(fiiPct) : null;
  let institutions = hasSplit ? clamp01pct(institutionsPct) : clamp01pct(instPctTotal);
  let pub       = publicPct != null ? clamp01pct(publicPct) : null;

  // When we have DII/FII, institutions is redundant; keep it for reference but you can omit from response if you prefer.
  // Compute 'others' mostly as remainder (avoid negatives due to rounding)
  let knownSum = 0;
  for (const v of [promoters, dii, fii, pub]) if (Number.isFinite(v)) knownSum += v;
  let others = clamp01pct(100 - knownSum);
  if (!Number.isFinite(others)) others = null;

  return {
    symbol,
    country,
    units: "percent",
    asOf: new Date().toISOString(),
    totals: {
      promoters,
      dii,
      fii,
      public: pub,
      others,
      institutions, // informative; can remove if you only want DII/FII split
    },
    notes: [
      !hasSplit
        ? "DII/FII split was not available from Yahoo holders data for this symbol; dii and fii set to null."
        : "DII/FII split computed by aggregating institution and fund holders by country versus issuer country.",
      "Promoters approximated from Yahoo 'heldByInsiders'. This may differ from local definitions for some markets.",
    ],
  };
}
