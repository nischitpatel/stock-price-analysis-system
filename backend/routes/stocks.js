import express from "express";
import YahooFinance from "yahoo-finance2";
// import { computePeriodRange, makeFieldGetter, toISO, prefixForType } from "../helpers/finHelpers.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
    balanceSheetRaw,
    incomeStatementRaw,
    balanceSheetNormalized,
    incomeStatementNormalized
  } from "../controllers/stocks.controller.js";
import { trendingSymbols } from "../controllers/market.controller.js";
import { pePbHistory } from "../controllers/valuation.controller.js";
import { shareholding } from "../controllers/ownership.controller.js";
import { marketNews } from "../controllers/news.controller.js";
import { companyLatestNews } from "../controllers/news.controller.js";
import { getUsTop5Indices } from "../services/indices.service.js";

const yahooFinance = new YahooFinance();

const router = express.Router();

// Get latest price
router.get("/price/:symbol", async (req, res) => {
    const { symbol } = req.params;
    try {
        const quote = await yahooFinance.quote(symbol);
        console.log(quote);
        res.json({
            symbol: quote.symbol,
            shortName: quote.shortName,
            regularMarketPrice: quote.regularMarketPrice,
            currency: quote.currency,
            marketState: quote.marketState,
            timestamp: quote.regularMarketTime,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error fetching stock price" });
    }
});


const getDateNDaysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};


// Get historical data (intraday, daily, weekly, monthly)
router.get("/history/:symbol/:interval", async (req, res) => {
    const { symbol, interval } = req.params;

    let intervalOption, period1;

    const now = new Date();

    switch (interval) {
        case "intraday":
            intervalOption = "5m";
            period1 = getDateNDaysAgo(5);  // last 5 days
            break;
        case "daily":
            intervalOption = "1d";
            period1 = getDateNDaysAgo(30); // last 30 days
            break;
        case "weekly":
            intervalOption = "1wk";
            period1 = getDateNDaysAgo(365); // last 1 year
            break;
        case "monthly":
            intervalOption = "1mo";
            period1 = getDateNDaysAgo(365 * 5); // last 5 years
            break;
        default:
            return res.status(400).json({ error: "Invalid interval" });
    }

    try {
        const result = await yahooFinance.chart(symbol, {
            interval: intervalOption,
            period1: period1,
            period2: now,
        });

        res.json({
            symbol,
            interval,
            history: result.quotes.map(item => ({
                date: item.date,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
                volume: item.volume,
            })),
        });
    } catch (error) {
        console.error("Yahoo Finance Chart Error:", error);
        res.status(500).json({ error: "Error fetching historical data", details: error.message });
    }
});

// RAW passthroughs (keep everything from fundamentalsTimeSeries)
router.get("/balance-sheet/:symbol",      asyncHandler(balanceSheetRaw));
router.get("/income-statement/:symbol",   asyncHandler(incomeStatementRaw));

// Normalized (trimmed fields + derived ratios)
router.get("/balance-sheet/normalized/:symbol",    asyncHandler(balanceSheetNormalized));
router.get("/income-statement/normalized/:symbol", asyncHandler(incomeStatementNormalized));

// Market data
router.get("/trending", asyncHandler(trendingSymbols));

// Valuation
router.get("/valuation/:symbol", asyncHandler(pePbHistory));

// Ownership
router.get("/ownership/:symbol", asyncHandler(shareholding));

// Market News
router.get("/news", asyncHandler(marketNews));

// Company Latest News
router.get("/news/:symbol", asyncHandler(companyLatestNews));

// US Top 5 Indices
router.get("/indices/us/top5", asyncHandler(getUsTop5Indices));

export default router;




