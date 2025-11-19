import yahooFinance from "../config/yahooFinanceClient.js";
import { computePeriodRange, prefixForType, makeFieldGetter, toISO } from "../helpers/finHelpers.js";

/* ---------- RAW passthrough ---------- */
export async function getBalanceSheetRaw(symbol, { type, from, to }) {
  const { period1, period2 } = computePeriodRange(type, from, to);
  const opts = { type, module: "balance-sheet", period1, period2 };
  const data = await yahooFinance.fundamentalsTimeSeries(symbol, opts, { validateResult: false });
  return { request: opts, data };
}

export async function getIncomeStatementRaw(symbol, { type, from, to }) {
  const { period1, period2 } = computePeriodRange(type, from, to);
  const opts = { type, module: "financials", period1, period2 };
  const data = await yahooFinance.fundamentalsTimeSeries(symbol, opts, { validateResult: false });
  return { request: opts, data };
}

/* ---------- Normalized balance sheet ---------- */
export async function getBalanceSheetNormalized(symbol, { type, from, to, limit = 6 }) {
  const { period1, period2 } = computePeriodRange(type, from, to);
  const opts = { type, module: "balance-sheet", period1, period2 };
  const raw = await yahooFinance.fundamentalsTimeSeries(symbol, opts, { validateResult: false });

  const PFX = prefixForType(type);
  const statements = (raw || [])
    .filter(r => r && (r.TYPE === "BALANCE_SHEET" || r.date))
    .map((r) => {
      const getF = makeFieldGetter(r, PFX);

      const totalAssets               = getF("TotalAssets","Assets");
      const totalLiab                 = getF("TotalLiabilitiesNetMinorityInterest","TotalLiabilities");
      const totalStockholderEquity    = getF("StockholdersEquity","CommonStockEquity","TotalShareholdersEquity");
      const totalCurrentAssets        = getF("TotalCurrentAssets","CurrentAssets");
      const totalCurrentLiabilities   = getF("TotalCurrentLiabilities","CurrentLiabilities");
      const longTermDebt              = getF("LongTermDebt");
      const shortTermDebt             = getF("ShortTermDebt","ShortLongTermDebt","CurrentDebt");
      const cash                      = getF("CashAndCashEquivalents","CashCashEquivalentsAndShortTermInvestments","CashAndDueFromBanks");
      const netReceivables            = getF("NetReceivables","AccountsReceivable","GrossAccountsReceivable");
      const inventory                 = getF("Inventory","Inventories");
      const accountsPayable           = getF("AccountsPayable");
      const otherCurrentAssets        = getF("OtherCurrentAssets");
      const otherCurrentLiab          = getF("OtherCurrentLiabilities");
      const otherAssets               = getF("OtherAssets");
      const otherLiab                 = getF("OtherLiabilities");
      const propertyPlantEquipment    = getF("PropertyPlantEquipmentNet","NetPPE");
      const goodWill                  = getF("Goodwill","GoodWill");
      const intangibleAssets          = getF("OtherIntangibleAssets","GoodwillAndOtherIntangibleAssets");
      const minorityInterest          = getF("MinorityInterest","NoncontrollingInterests");

      const netWorkingCapital = (Number.isFinite(totalCurrentAssets) && Number.isFinite(totalCurrentLiabilities))
        ? totalCurrentAssets - totalCurrentLiabilities : null;

      const currentRatio = (Number.isFinite(totalCurrentAssets) && Number.isFinite(totalCurrentLiabilities) && totalCurrentLiabilities !== 0)
        ? totalCurrentAssets / totalCurrentLiabilities : null;

      const quickAssets = [cash, netReceivables].filter(Number.isFinite).reduce((a,b)=>a+b, 0);
      const quickRatio = (quickAssets && Number.isFinite(totalCurrentLiabilities) && totalCurrentLiabilities !== 0)
        ? quickAssets / totalCurrentLiabilities : null;

      const debtToEquity = (Number.isFinite(totalLiab) && Number.isFinite(totalStockholderEquity) && totalStockholderEquity !== 0)
        ? totalLiab / totalStockholderEquity : null;

      return {
        endDate: toISO(r.date),
        totalAssets, totalLiab, totalStockholderEquity,
        totalCurrentAssets, totalCurrentLiabilities,
        cash, netReceivables, inventory,
        longTermDebt, shortTermDebt, accountsPayable,
        propertyPlantEquipment, goodWill, intangibleAssets,
        otherAssets, otherCurrentAssets, otherLiab, otherCurrentLiab,
        minorityInterest,
        netWorkingCapital, currentRatio, quickRatio, debtToEquity
      };
    })
    .filter(s => s.endDate)
    .sort((a,b)=> (a.endDate < b.endDate ? 1 : -1))
    .slice(0, limit);

  return { request: opts, statements, period1, period2 };
}

/* ---------- Normalized income statement ---------- */
export async function getIncomeStatementNormalized(symbol, { type, from, to, limit = 6 }) {
  const { period1, period2 } = computePeriodRange(type, from, to);
  const opts = { type, module: "financials", period1, period2 };
  const raw = await yahooFinance.fundamentalsTimeSeries(symbol, opts, { validateResult: false });

  const PFX = prefixForType(type);
  const statements = (raw || [])
    .filter(r => r && (r.TYPE === "FINANCIALS" || r.periodType))
    .map((r) => {
      const getF = makeFieldGetter(r, PFX);

      const totalRevenue     = getF("TotalRevenue","Revenues","OperatingRevenue");
      const costOfRevenue    = getF("CostOfRevenue");
      const grossProfit      = getF("GrossProfit");
      const operatingExpense = getF("OperatingExpense");
      const sga              = getF("SellingGeneralAndAdministration");
      const rnd              = getF("ResearchAndDevelopment");
      const operatingIncome  = getF("OperatingIncome");
      const ebit             = getF("EBIT");
      const ebitda           = getF("EBITDA","NormalizedEBITDA");
      const interestExpense  = getF("InterestExpense","InterestExpenseNonOperating");
      const incomeTaxExpense = getF("IncomeTaxExpense","TaxProvision");
      const netIncome        = getF("NetIncome","NetIncomeCommonStockholders","NetIncomeFromContinuingAndDiscontinuedOperation");
      const epsDiluted       = getF("DilutedEPS","BasicEPS");
      const sharesDiluted    = getF("DilutedAverageShares","AverageDilutionEarnings","BasicAverageShares");

      const grossMargin      = (Number.isFinite(grossProfit)     && Number.isFinite(totalRevenue) && totalRevenue !== 0) ? grossProfit / totalRevenue : null;
      const operatingMargin  = (Number.isFinite(operatingIncome) && Number.isFinite(totalRevenue) && totalRevenue !== 0) ? operatingIncome / totalRevenue : null;
      const netMargin        = (Number.isFinite(netIncome)       && Number.isFinite(totalRevenue) && totalRevenue !== 0) ? netIncome / totalRevenue : null;
      const interestCoverage = (Number.isFinite(ebit)            && Number.isFinite(interestExpense) && interestExpense !== 0) ? ebit / Math.abs(interestExpense) : null;

      return {
        endDate: toISO(r.date),
        totalRevenue, costOfRevenue, grossProfit,
        operatingExpense, sga, rnd, operatingIncome,
        ebit, ebitda, interestExpense, incomeTaxExpense, netIncome,
        epsDiluted, sharesDiluted,
        grossMargin, operatingMargin, netMargin, interestCoverage
      };
    })
    .filter(s => s.endDate)
    .sort((a,b)=> (a.endDate < b.endDate ? 1 : -1))
    .slice(0, limit);

  return { request: opts, statements, period1, period2 };
}
