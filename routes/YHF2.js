import yahooFinance from 'yahoo-finance2';

// 1. Get the Historical Data for a specific ticker in a given period
export async function getTickerHistoricalData(period1, period2, interval, ticker) {
    const options = {
        period1: period1,
        period2: period2,
        interval: interval,
    };
    
    try {
        const result = await yahooFinance.chart(ticker, options);
        console.log(`Historical data for ${ticker}:`);
        console.log(result);
        return result;
    } catch (err) {
        console.error('Error fetching historical data:', err);
    }
}

// 2. Get the Historical Data for a list of tickers in a given period
export async function getMultipleTickersHistoricalData(period1, period2, interval, tickers) {
    const promises = tickers.map(ticker => 
        getTickerHistoricalData(period1, period2, interval, ticker)
    );

    const results = await Promise.all(promises);
    return results;
}

// 3. Get the Current Data for a specific ticker
export async function getTickerCurrentData(ticker) {
    try {
        const quote = await yahooFinance.quote(ticker);
        console.log(`Current data for ${ticker}:`);
        console.log(quote);
        return quote;
    } catch (err) {
        console.error(`Error fetching current price for ${ticker}:`, err);
    }
}

// 4. Get the Current Data for a list of tickers
export async function getMultipleTickersCurrentData(tickers) {
    const promises = tickers.map(ticker => getTickerCurrentData(ticker));
    const results = await Promise.all(promises);
    return results;
}

// Example usage
// 1. getTickerHistoricalData('2025-07-01', '2025-07-27', '1d', 'AAPL');
// 2. getMultipleTickersHistoricalData('2025-07-01', '2025-07-27', '1d', ['AAPL', 'GOOGL', 'MSFT']);
// 3. getTickerCurrentData('AAPL');
// 4. getMultipleTickersCurrentData(['AAPL', 'GOOGL', 'MSFT']);