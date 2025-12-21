import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({
    validateResult: false, 
    suppressNotices: ['yahooSurvey']
}); // v3 instance
export default yahooFinance;
