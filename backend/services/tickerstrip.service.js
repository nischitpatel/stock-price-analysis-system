import yahooFinance from "../config/yahooFinanceClient.js";

export async function tickerStrip() {
    try {
        const result = await yahooFinance.quote(
            [
                "AAPL","MSFT","NVDA","GOOGL","GOOG","AMZN","META","TSLA","AVGO","PEP",
                "COST","CMCSA","ADBE","CSCO","TXN","QCOM","INTC","NFLX","AMGN","HON",
                "AMAT","SBUX","BKNG","GILD","INTU","MDLZ","ISRG","VRTX","ADP","LRCX",
                "MU","ZM","REGN","ILMN","ATVI","ROST","EBAY","ADI","SNPS","MAR",
                "XEL","CSX","FISV","BIIB","MELI","IDXX","VRSK","EXC","KLAC","WBA",
                "LULU","KDP","DOCU","PDD","SIRI","CTSH","WDAY","MSCI","CERN","ASML",
                "ORLY","ROKU","PCAR","ETSY","ANSS","XLNX","OKTA","SBAC",
                "DXCM","PAYX","FTNT","CHTR","MCHP","NLOK","NTES","PCOR","CRWD","ZS",
                "SNOW","TEAM","SPOT","ENPH","TTWO","CPRT","DLTR","UAL",
                "ZBRA","CHKP","PAYC","CAG","MLNX","HUBS","SPLK","WDC","VRSN","TXG",
                "ALGN","PHM","CEG","NDAQ","LHX","CTAS","ESPR","BA","CAT","RTX",
                "JNJ","VZ","T"
            ],
            {
                fields: [
                    "regularMarketChangePercent",
                    "regularMarketPrice",
                    "symbol"
                ]
            }
        );

        const filtered = result.map(item => ({
            symbol: item.symbol,
            regularMarketChangePercent: item.regularMarketChangePercent,
            regularMarketPrice: item.regularMarketPrice
          }));

        return filtered;
    } catch (error) {
        console.error("YahooFinance2 Error:", error);
        throw new Error("Failed to fetch most active tickers");
    }
}
